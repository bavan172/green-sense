# Green Sense

## Description

**Green Sense** is a web application that helps users offset their carbon footprint by supporting tree planting projects.

It consists of:
- **Frontend:** Angular application providing a user interface.  
- **Backend:** Node.js server handling API requests and connecting with MongoDB.  
---

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (recommended version: 18.x)  
- **npm** (recommended version: 9.x)  
- **MongoDB URI** (available via MongoDB Atlas or local instance)  
- **Patch.io API key** (sign up at the [Patch.io Developer Portal](https://www.patch.io))  
- **Git**

---

## Setup and Run

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your configuration:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PATCH_IO_API_KEY=your_patch_io_api_key
   PORT=8080
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

The backend will run at:  
👉 **http://localhost:8080**

---

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend for production:
   ```bash
   npm run build
   ```

4. Serve the built files:
   - Using a static server, for example:
     ```bash
     npm install -g serve
     serve -s dist/your-angular-app-folder
     ```
   - Or serve via your backend or another HTTP server.

Frontend will be available locally on port **5000** (or as configured).

---

## Environment Variables

| Variable            | Description                                  |
|----------------------|----------------------------------------------|
| `MONGO_URI`          | MongoDB connection string                    |
| `PATCH_IO_API_KEY`   | Patch.io API key for carbon offset purchases |
| `PORT`               | Backend server port (default: 8080)          |

---

## Deployment Tips

- Do **not** use `ng serve` in production; always build static files.  
- Configure your backend to serve static frontend files or deploy frontend separately on static hosting.  
- Ensure all environment variables are set correctly in your deployment environment.  
- Monitor logs and health checks in your hosting platform for readiness and errors.

---

## Carbon Offset Integration

- Integrates **Patch.io API** to list and purchase carbon offset projects.  
- Tracks user contributions and displays their environmental impact.  
- Refer to [Patch.io API Documentation](https://www.patch.io) for integration details.

---

## Troubleshooting

- **Build failures?** Verify Node.js version in `package.json` under `engines`.  
- **Resource or fork errors?** Optimize build and deployment environments.  
- **Database issues?** Ensure MongoDB URI is correct and accessible.  
- **Health check failures?** Confirm configured ports and server readiness.  

---

## License

Specify your license here (e.g., MIT, Apache 2.0, etc.).

---

### Sample `.env` (Optional)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/greensense
PATCH_IO_API_KEY=sk_test_yourpatchapikey
PORT=8080
```

---

✅ *This README provides a complete overview, setup, and deployment guide for Green Sense.*
