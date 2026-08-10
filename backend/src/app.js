import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import productRoutes from './modules/products/product.routes.js';
import saleRoutes from './modules/sales/sale.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import exportRoutes from './modules/export/export.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import messageRoutes from './modules/messages/message.routes.js';
import systemRoutes from './modules/system/system.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

const allowedOrigins = env.CORS_ORIGINS;

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*')) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (!env.isProd) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.e2b.app') || origin.includes('vercel.app')) {
        return cb(null, true);
      }
    }
    console.warn(`[CORS Fylo] Blocked origin: ${origin}, allowed: ${allowedOrigins.join(', ')}`);
    return cb(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Location'],
  exposedHeaders: ['Content-Disposition'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(compression());
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Кўп уриниш — кейинроқ қайта урининг. Too many attempts.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', project: 'Fylo', bot: '@FyloRobot', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

const keepServerAlive = () => {
  if (!process.env.BASE_URL) {
    console.warn('⚠️ BASE_URL is not set. Skipping ping.')
    return
  }

  setInterval(() => {
    axios
      .get(`${process.env.BASE_URL}/api/health`)
      .then(() => console.log('🔄 Server active'))
      .catch(err => console.log('⚠️ Ping failed:', err.message))
  }, 10 * 60 * 1000)
}

keepServerAlive()

app.use((req, _res, next) => {
  req.io = req.app.get('io');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/system', systemRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
