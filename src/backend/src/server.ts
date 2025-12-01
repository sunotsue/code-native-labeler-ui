import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { taskRoutes } from './routes/tasks';
import { testRoutes } from './routes/tests';
import { labelRoutes } from './routes/labels';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', taskRoutes);
app.use('/api', testRoutes);
app.use('/api', labelRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Code labeling backend running on http://localhost:${PORT}`);
  console.log(`📝 Task endpoint: GET /api/task/:id`);
  console.log(`🧪 Test endpoint: POST /api/run-tests`);
  console.log(`📊 Label endpoint: POST /api/label`);
});

export default app;
