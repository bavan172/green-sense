import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const uploadBillAndExtractText = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bill = new Bill({
      user: req.user._id,
      filename: file.originalname,  
    });
    await bill.save();

    const dataBuffer = fs.readFileSync(file.path);
    let extracted = '';
    
    try {
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const base64Data = dataBuffer.toString('base64');
      
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        },
        'Extract all text content from this PDF document. Return only the extracted text without any additional commentary.'
      ]);
      
      const response = await result.response;
      extracted = response.text() || '';
    } catch (e) {
      console.warn('Gemini extraction failed, returning empty text', e.message);
      extracted = '';
    }

    const { redacted, pii } = redactPII(extracted);

    bill.textExtract = extracted;
    bill.redactedText = redacted;
    bill.pii = pii;
    await bill.save();

    res.json({ 
      id: bill._id, 
      filename: bill.filename, 
      path: bill.path, 
      text: extracted, 
      redacted, 
      pii 
    });
  } catch (error) {
    console.error('Upload error', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const getBillPdf = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    if (!bill.processedReport || !bill.processedReport.pdfBuffer) {
      return res.status(404).json({ message: 'Processed PDF not found' });
    }

    const pdfBuffer = Buffer.from(bill.processedReport.pdfBuffer, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-report-${bill._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Get PDF error', error);
    res.status(500).json({ message: 'Failed to get PDF', error: error.message });
  }
};