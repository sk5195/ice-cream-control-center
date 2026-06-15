import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import sellerRoutes from './routes/sellers.js';
import salesRoutes from './routes/sales.js';
import inventoryRoutes from './routes/inventory.js';
import refrigeratorRoutes from './routes/refrigerator.js';
import areaRoutes from './routes/areas.js';
import aiRoutes from './routes/ai.js';
import wastageRoutes from './routes/wastage.js';
import reportRoutes from './routes/reports.js';
import Seller from './models/Seller.js';
import User from './models/User.js';
import { runSeed } from './seed/seedData.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'icecream-dev-insecure-jwt-secret-set-JWT_SECRET-in-production';
  console.warn('WARNING: JWT_SECRET is not set. Using an insecure default. Set JWT_SECRET in your environment for production.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');
const serveClient = fs.existsSync(path.join(clientDist, 'index.html'));

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: true, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/refrigerator', refrigeratorRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wastage', wastageRoutes);
app.use('/api/reports', reportRoutes);

if (serveClient) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-dashboard', () => {
    socket.join('dashboard');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

// Simulate real-time seller GPS movement
setInterval(async () => {
  try {
    const sellers = await Seller.find({ isActive: true, status: { $ne: 'offline' } });
    for (const seller of sellers) {
      const jitter = () => (Math.random() - 0.5) * 0.002;
      seller.location.lat += jitter();
      seller.location.lng += jitter();
      seller.lastLocationUpdate = new Date();
      await seller.save();

      io.to('dashboard').emit('seller-location', {
        id: seller._id,
        name: seller.name,
        lat: seller.location.lat,
        lng: seller.location.lng,
        status: seller.status,
        currentStock: seller.currentStock,
        salesToday: seller.salesToday
      });
    }
  } catch (err) {
    console.error('GPS simulation error:', err.message);
  }
}, 5000);

async function startServer() {
  await connectDB();

  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Empty database — loading sample data...');
    await runSeed();
  }

  if (!serveClient && process.env.NODE_ENV === 'production') {
    console.warn('WARNING: client/dist not found. Run "npm run build" before starting.');
  }

  httpServer.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    const localUrl = `http://localhost:${PORT}`;
    const networkUrl = `http://${localIP}:${PORT}`;
    const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;

    console.log('');
    console.log('==================================================');
    console.log('  ICE CREAM CONTROL CENTER - READY');
    console.log('==================================================');
    if (publicUrl) {
      console.log(`  Live website:       ${publicUrl}`);
    }
    console.log(`  On this machine:    ${localUrl}`);
    if (localIP !== 'localhost' && !publicUrl) {
      console.log(`  Share on network:   ${networkUrl}`);
    }
    console.log('  Login: admin@icecream.com / admin123');
    console.log('==================================================');
    console.log('');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { io };
