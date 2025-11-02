const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const metricRoutes = require('./routes/metricRoutes');
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const billRoutes = require('./routes/billRoutes');
const Goal = require('./models/Goal');
const Bill = require('./models/Bill');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);




app.get('/', (req, res) => {
  res.send('Server is up and running! Welcome to the homepage.');
});


app.use(cors());
app.use(bodyParser.json());
app.use('/api/metrics', metricRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/upload', billRoutes);
// storage for uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// helper: redaction (simple regex-based PII redaction)
function redactPII(text) {
  if (!text) return { redacted: '', pii: [] };
  const pii = [];
  // emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let m;
  while ((m = emailRegex.exec(text)) !== null) {
    pii.push({ type: 'email', match: m[0] });
  }
  text = text.replace(emailRegex, '[[REDACTED_EMAIL]]');
  // phones (very loose)
  const phoneRegex = /\+?\d[\d ()-]{6,}\d/g;
  while ((m = phoneRegex.exec(text)) !== null) {
    pii.push({ type: 'phone', match: m[0] });
  }
  text = text.replace(phoneRegex, '[[REDACTED_PHONE]]');
  // account numbers (sequences of 8+ digits)
  const acctRegex = /\b\d{8,}\b/g;
  while ((m = acctRegex.exec(text)) !== null) {
    pii.push({ type: 'account', match: m[0] });
  }
  text = text.replace(acctRegex, '[[REDACTED_ACCOUNT]]');
  return { redacted: text, pii };
}

// Helper: call Gemini model with prompt and return text
async function callGemini(prompt, options = {}) {
  const model = genAI.getGenerativeModel({ model: options.model || 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Upload bill PDF
app.post('/api/uploads/bill', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.body.userId || null; // optional
    const bill = new Bill({ user: userId, filename: req.file.originalname, path: req.file.path });
    await bill.save();
    res.json({ id: bill._id, filename: bill.filename, path: bill.path });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Extract text from uploaded bill and optionally process through Gemini
app.post('/api/uploads/:id/extract', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    const dataBuffer = fs.readFileSync(bill.path);
    let extracted = '';
    try {
      const pdfData = await pdfParse(dataBuffer);
      extracted = pdfData.text || '';
    } catch (e) {
      console.warn('pdf-parse failed, returning empty text', e.message);
      extracted = '';
    }
    const { redacted, pii } = redactPII(extracted);
    bill.textExtract = extracted;
    bill.redactedText = redacted;
    bill.pii = pii;
    await bill.save();
    res.json({ id: bill._id, text: extracted, redacted, pii });
  } catch (err) {
    console.error('Extraction error', err);
    res.status(500).json({ error: 'Extraction failed' });
  }
});

// Consent endpoint to allow user to include detected PII in processing
app.post('/api/uploads/:id/consent', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    const { includePII } = req.body;
    bill.includePII = !!includePII;
    await bill.save();
    res.json({ id: bill._id, includePII: bill.includePII });
  } catch (err) {
    console.error('Consent error', err);
    res.status(500).json({ error: 'Consent save failed' });
  }
});

// Process bill through Gemini and generate a PDF report
app.post('/api/uploads/:id/process', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
  const text = bill.textExtract || fs.readFileSync(bill.path, 'utf8');
  const includePII = !!bill.includePII;
  const promptText = includePII ? text : bill.redactedText || text;
    // Build prompt for Gemini: ask for line-item extraction, categories, totals, carbon estimate
  const prompt = `You are Gaia, an assistant that extracts billing data for ESG reporting.
Input bill text:
"""
${promptText.slice(0, 50000)}
"""

OUTPUT JSON with fields: vendor, invoice_date, invoice_number, total_amount, currency, line_items [{description, quantity, unit_price, amount, category}], estimated_co2_kg (if possible), notes.
Return only valid JSON.`;

    const aiResponse = await callGemini(prompt, { model: 'gemini-2.5-flash' });
    let parsed = null;
    try {
      // find first JSON block in aiResponse
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Failed to parse Gemini JSON, returning raw text');
    }
    bill.processedReport = parsed || { raw: aiResponse };
    bill.processedAt = new Date();
    await bill.save();

    // generate PDF report server-side
    const reportPath = path.join(uploadsDir, `report-${bill._id}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(reportPath);
    doc.pipe(writeStream);
    doc.fontSize(18).text('ESG Bill Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Bill: ${bill.filename}`);
    doc.text(`Processed At: ${bill.processedAt.toISOString()}`);
    doc.moveDown();
    doc.fontSize(14).text('Extracted Report:');
    doc.fontSize(10).text(JSON.stringify(bill.processedReport, null, 2));
    doc.end();
    await new Promise((resolve) => writeStream.on('finish', resolve));

    res.json({ id: bill._id, reportPdf: `/api/uploads/${bill._id}/report` });
  } catch (err) {
    console.error('Processing error', err);
    res.status(500).json({ error: 'Processing failed', details: err.message });
  }
});

// Download generated report PDF
app.get('/api/uploads/:id/report', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    const reportPath = path.join(uploadsDir, `report-${bill._id}.pdf`);
    if (!fs.existsSync(reportPath)) return res.status(404).json({ error: 'Report not generated' });
    res.sendFile(reportPath);
  } catch (err) {
    console.error('Report download error', err);
    res.status(500).json({ error: 'Could not fetch report' });
  }
});
app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  try {
    const goals = await Goal.find({ userId });
    const formattedGoals = goals.map((goal) => {
      const milestones = goal.milestones
        .map((milestone) => `- ${milestone.description} (Completed: ${milestone.completed})`)
        .join("\n");
      return `Goal: ${goal.title}\nProgress: ${goal.progress}%\nMilestones:\n${milestones}`;
    }).join("\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    You are Gaia, an ESG and sustainability assistant. Your role is to help users understand their energy consumption, analyze billing data, and receive personalized recommendations to reduce costs and carbon footprint.

    User's sustainability goals:
    ${formattedGoals}

    User message:
    "${message}"

    INSTRUCTIONS:
    1. Respond in a friendly, supportive, and motivational tone.
    2. Give clear, specific, and personalized suggestions based on the user's goals and message.
    3. Do NOT use markdown formatting. Avoid symbols like *, #, >, or **. 
      Write plain text only.
    4. Keep your advice practical and simple — something a person can actually act on.
    5. If the user sounds unmotivated or unsure, encourage them gently.

    OUTPUT FORMAT (use plain text paragraphs):

    Summary:
    Briefly describe the user's situation or concern.

    Top Recommendations:
    Provide 3 to 5 numbered steps (1), 2), 3) ...) that address their goals or reduce energy use and billing cost.

    Impact:
    Explain how these actions can improve sustainability and save money.

    Motivation:
    End with a short, uplifting closing remark.

    Now write your response.
    `;


    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Response:", response);
    const text = response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to GreenPulse ESG Tracker API!');
});

module.exports = app;
