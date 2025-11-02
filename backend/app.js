const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const metricRoutes = require('./routes/metricRoutes');
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const Goal = require('./models/Goal');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function responsibilityReportsUrl(companySlug) {
  return `https://www.responsibilityreports.com/Company/${encodeURIComponent(companySlug)}`;
}

async function fetchYahooESG(ticker) {
  const apiUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=esgScores`;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await axios.get(apiUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Referer': `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`
        }
      });
      return resp.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        console.warn('quoteSummary API unauthorized (401); will attempt page fallback');
        break;
      }
      if (status === 429) {
        const backoff = 500 * Math.pow(2, attempt - 1);
        console.warn(`quoteSummary API rate limited (429). Retry ${attempt}/${maxAttempts} after ${backoff}ms`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      if (attempt < maxAttempts) {
        const backoff = 200 * attempt;
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      console.warn('quoteSummary API failed after retries:', err.message || err);
      break;
    }
  }

  // Fallback: scrape the Yahoo sustainability page which contains initial state JSON
  try {
    console.warn('Falling back to page scrape for', ticker);
    const pageUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}/sustainability?p=${encodeURIComponent(ticker)}`;
    const pageResp = await axios.get(pageUrl, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = pageResp.data;

    // Attempt to extract the root.App.main JSON blob
    const m = html.match(/root\.App\.main\s*=\s*(\{[\s\S]*?\})\s*;\s*/m);
    if (m && m[1]) {
      try {
        const appState = JSON.parse(m[1]);
        const esg = appState?.context?.dispatcher?.stores?.QuoteSummaryStore?.esgScores;
        if (esg) return { quoteSummary: { result: [ { esgScores: esg } ] } };
      } catch (e) {
        console.warn('Failed to parse embedded JSON from Yahoo page:', e.message || e);
      }
    }

    // Last-ditch: try to find an "esgScores" JSON object inline
    const esgMatch = html.match(/"esgScores"\s*:\s*(\{[\s\S]*?\})/s);
    if (esgMatch && esgMatch[1]) {
      try {
        const esgObj = JSON.parse(esgMatch[1]);
        return { quoteSummary: { result: [ { esgScores: esgObj } ] } };
      } catch (e) {
        console.warn('Failed to parse esgScores JSON fragment:', e.message || e);
      }
    }
  } catch (e) {
    console.warn('Page fetch fallback failed:', e.message || e);
  }

  throw new Error('Unable to retrieve ESG data from Yahoo');
}

// Simple in-memory cache: key -> { data, expiresAt }
const esgCache = new Map();

async function getCachedESG(ticker) {
  const key = ticker.toUpperCase();
  const cached = esgCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.data;
  const data = await fetchYahooESG(key);
  // cache for 5 minutes
  esgCache.set(key, { data, expiresAt: now + 5 * 60 * 1000 });
  return data;
}

app.get('/api/esg', async (req, res) => {
  const ticker = (req.query.ticker || '').toUpperCase();
  if (!ticker) return res.status(400).json({ error: 'ticker query param required' });

  try {
  const data = await getCachedESG(ticker);
    const esg = data?.quoteSummary?.result?.[0]?.esgScores || null;
    const reportUrl = responsibilityReportsUrl(ticker.toLowerCase());
    res.json({ ticker, esg, reportUrl });
  } catch (err) {
    console.error('ESG fetch error', err.message || err);
    res.status(500).json({ error: 'Failed to fetch ESG data', details: err.message });
  }
});


app.get('/', (req, res) => {
  res.send('Server is up and running! Welcome to the homepage.');
});


app.use(cors());
app.use(bodyParser.json());
app.use('/api/metrics', metricRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
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
