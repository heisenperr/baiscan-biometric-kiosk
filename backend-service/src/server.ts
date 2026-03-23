import 'reflect-metadata';
import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sensorRoutes from './routes/sensorRoutes';
import authRoutes from './routes/authRoutes';
import sensorService from './services/sensorService';
import { AppDataSource } from './data-source';

const app: Application = express();
const httpServer: HttpServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT: string | number = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'BaiScan Biometric Kiosk Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Modular Routes
app.use('/sensor', sensorRoutes);
app.use('/api/auth', authRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('[SOCKET] Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('[SOCKET] Client disconnected:', socket.id);
  });
});

// Start Sensor Polling & Streaming
sensorService.startPolling(io);

// Start Server after DB Init
AppDataSource.initialize()
  .then(() => {
    console.log("[DB] Data Source has been initialized!");
    httpServer.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`BAI Scan Backend (Modular) on port ${PORT}`);
      console.log(`========================================`);
    });
  })
  .catch((err: any) => {
    console.error("[DB] Error during Data Source initialization", err);
  });
