import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import sensorRoutes from './routes/sensorRoutes';
import sensorService from './services/sensorService';

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
app.use(cors());
app.use(express.json());

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

// Socket.IO
io.on('connection', (socket) => {
  console.log('[SOCKET] Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('[SOCKET] Client disconnected:', socket.id);
  });
});

// Start Sensor Polling & Streaming
sensorService.startPolling(io);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`BAI Scan Backend (Modular) on port ${PORT}`);
  console.log(`========================================`);
});
