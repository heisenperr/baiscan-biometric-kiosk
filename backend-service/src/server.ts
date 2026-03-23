import 'reflect-metadata';
import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sensorRoutes from './routes/sensorRoutes';
import authRoutes from './routes/authRoutes';
import notificationRoutes from './routes/notificationRoutes';
import sensorService from './services/sensorService';
import { AppDataSource } from './data-source';
import { seedAdmin } from './seeds/adminSeeder';

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
app.use('/api/notification', notificationRoutes);

// Socket.IO
app.set('io', io); // Make 'io' accessible to controllers

io.on('connection', (socket) => {
  console.log('[SOCKET] Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('[SOCKET] Client disconnected:', socket.id);
  });
});

// Start Sensor Polling & Streaming
sensorService.startPolling(io);

// Start Server after DB Init with retry logic
const startServer = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await AppDataSource.initialize();
      console.log("[DB] Data Source has been initialized!");
      
      // Auto-seed admin account
      await seedAdmin(AppDataSource);
      
      httpServer.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`BAI Scan Backend (Modular) on port ${PORT}`);
        console.log(`========================================`);
      });
      break;
    } catch (err: any) {
      console.error(`[DB] Initialization error (${retries} retries left):`, err.message);
      retries -= 1;
      if (retries === 0) {
        console.error("[DB] Could not connect to database after several attempts. Exiting.");
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

startServer();
