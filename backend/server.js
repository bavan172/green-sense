require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// create HTTP server so we can attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// attach io to app so controllers can emit events
app.locals.io = io;

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

if (!mongoURI) {
  console.warn('MONGO_URI not set — starting server without MongoDB (dev only).');
  app.use(cors());
  server.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
} else {
  mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
    app.use(cors());
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
}
