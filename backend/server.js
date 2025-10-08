// backend/server.js — top of file (put this *first*)
import 'dotenv/config'; // loads .env before any other imports

import express from 'express';
import path from "path";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import { rateLimitConfig } from './middleware/rateLimiting.js';

import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/booking.js';
import studioRoutes from './routes/studio.js';
import paymentRoutes from './routes/payment.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';



// REMOVE any later dotenv.config() call since we used import 'dotenv/config'


// dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(helmet());
app.use(morgan('combined'));
const allowedOrigins = [
  "*"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitConfig);

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/studio', studioRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-calendar', (date) => {
    socket.join(`calendar-${date}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// app.use('/:catchAll(*)', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });



app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message 
  });
});

const __dirname = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("/{*any}", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Change this line - Express 5 doesn't support /{*any} syntax
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});