import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import categoryRoutes from './presentation/routes/categoryRoutes';
import provisionRoutes from './presentation/routes/provisionRoutes';
import expenseRoutes from './presentation/routes/expenseRoutes';
import reportRoutes from './presentation/routes/reportRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Management API is running' });
});

// Routes
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
