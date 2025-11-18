import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

import categoryRoutes from './presentation/routes/categoryRoutes';
import provisionRoutes from './presentation/routes/provisionRoutes';
import expenseRoutes from './presentation/routes/expenseRoutes';
import reportRoutes from './presentation/routes/reportRoutes';
import { authenticateToken } from './infrastructure/middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// ✅ CORS Configuration: Allow requests from Vercel frontend with credentials
const corsOptions = {
  origin: [
    'http://localhost:3001', // Local development
    'http://localhost:3000', // Fallback local
    'https://budget-manager-nu-liart.vercel.app', // Production Vercel frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// ✅ OPTIMIZED: Compression middleware to reduce response sizes by 60-80%
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6, // Balance between compression ratio and speed
}));
app.use(express.json());

// Public routes (no authentication required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Management API is running' });
});

// ✅ PROTECTED ROUTES: Apply authentication middleware globally to all /api routes
app.use('/api', authenticateToken);

// Routes (all protected by authenticateToken middleware)
app.use('/api/categories', categoryRoutes);
app.use('/api/provisions', provisionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Budget Management API ready`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
