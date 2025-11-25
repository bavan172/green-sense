# 🌿 Green Sense

**AI-Powered Energy & Sustainability Intelligence**

Green Sense transforms ordinary energy bills into actionable sustainability insights using **Google’s Gemini Generative AI**.
Upload a utility bill → get your carbon footprint, cost breakdown, and personalized reduction strategies — all in one dashboard.

---

## ✨ Description

**Green Sense** is a web application that helps users and organizations **analyze, track, and reduce their carbon footprint** by converting raw energy bills into detailed sustainability reports.

It integrates **Gemini’s multimodal AI** and real-time data APIs to provide:

* **Energy & CO₂ Analysis:** Automatically extract key metrics from uploaded PDFs (using Gemini API).
* **AI Chatbot:** Interactive Gemini-powered assistant that explains your energy data and suggests cost-saving strategies.
* **Leaderboard:** Compare your organization’s footprint with peers for gamified sustainability tracking.
* **Visual Reports:** Auto-generated graphs and summaries for monthly and yearly trends.

---

## 🧠 Tech Stack

| Layer              | Technologies                                                         |
| ------------------ | -------------------------------------------------------------------- |
| **Frontend**       | Angular, TypeScript, Chart.js, HTML5, CSS3                           |
| **Backend**        | Node.js, Express.js, Gemini API Integration                          |
| **Database**       | MongoDB Atlas                                                        |
| **AI/ML**          | Gemini 2.5 Pro for document parsing and text generation |
| **Visualization**  | Chart.js for energy and CO₂ analytics                        |

---

## ⚙️ Features

**Bill Upload & OCR Analysis**
Upload PDF or image-based bills — Gemini’s multimodal API extracts usage, cost, and billing period data.

**Automated CO₂ Calculation**
Converts energy consumption to carbon emissions using EPA and ElectricityMaps data.

**Interactive AI Chatbot**
Ask, “Why was my bill high this month?” or “How can I reduce peak demand?” and get context-aware answers.

**Leaderboard System**
Compare carbon intensity across organizations and departments.

**Visual Reports**
View monthly usage, costs, and CO₂ trends via intuitive graphs and dashboards.

**Carbon Offset Integration**
Partner APIs enable users to fund tree-planting projects and view real-time offset progress.
---

## 🧩 Project Structure

```
GreenSense/
├── backend/           # Node.js + Express server
│   ├── routes/        # API routes for analysis, leaderboard, chat
│   ├── services/      # Gemini API, MongoDB, and GCP integrations
│   └── app.js
│
├── frontend/          # Angular web app
│   ├── src/app/
│   ├── components/    # Dashboard, charts, chat, leaderboard
│   └── environments/
│
└── README.md
```

---

## 🔑 Environment Variables

| Variable                  | Description                                 |
| ------------------------- | ------------------------------------------- |
| `MONGO_URI`               | MongoDB Atlas connection string             |
| `PORT`                    | Backend server port (default: 8080)         |
| `GEMINI_API_KEY`          | Google Gemini API key for OCR + AI features |

---

## 🧰 Prerequisites

Before running the project, make sure you have:

* **Node.js** ≥ 18.x
* **npm** ≥ 9.x
* **MongoDB URI** (Atlas or local instance)
* **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
* **Git**

---

## 🚀 Setup and Run

### **Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8080
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm start
```

Backend runs at **[http://localhost:8080](http://localhost:8080)**

---

### **Frontend Setup**

```bash
cd frontend
npm install
npm run build
```

Serve the build:

```bash
npm install -g serve
serve -s dist/greensense
```

Frontend runs locally on **[http://localhost:5000](http://localhost:5000)**
---

## 🌳 Carbon Offset Integration

* Uses **Gemini API** to summarize and recommend verified offset options.
* Tracks cumulative CO₂ saved and displays progress visually in the user dashboard.

---

## 🧩 Troubleshooting

| Issue                 | Fix                                             |
| --------------------- | ----------------------------------------------- |
| Backend not starting  | Check `.env` and MongoDB URI                    |
| Gemini not responding | Verify `GEMINI_API_KEY` and API endpoint        |
| Build fails           | Ensure Node 18+ and correct dependency versions |
| Charts not loading    | Verify backend endpoints and data schema        |
| CORS errors           | Add appropriate middleware in `app.js`          |

---

## 🧾 License

Specify your license here (e.g., **MIT**, **Apache 2.0**, etc.)

---

### 🧪 Sample `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/greensense
PORT=8080
GEMINI_API_KEY=your_gemini_api_key
```

---

## ❤️ Acknowledgments

* **Google Gemini API** — for powering our AI insights and OCR.
* **Node.js + Angular + MongoDB** — our core stack for seamless integration.

---

✅ *Green Sense turns your utility data into environmental intelligence — helping businesses and individuals make every kilowatt count toward a cleaner, smarter future.*

---
