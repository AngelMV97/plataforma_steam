require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/articles', require('./routes/articles'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/cognitive-profiles', require('./routes/cognitive-profiles'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/session-requests', require('./routes/session-requests'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});