// railway-server.js - MINIMAL WORKING VERSION
import express from 'express';
import cors from 'cors';

const app = express();

// Super simple CORS - allow everything
app.use(cors());
app.use(express.json());

// Health check endpoint - NO RAG INIT
app.get('/api/health', (req, res) => {
  console.log('✅ Health check OK');
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Hiriya RAG Server is running',
    service: 'Ambo University AI Assistant'
  });
});

// Simple test endpoint
app.post('/api/rag/query', (req, res) => {
  const { query } = req.body;
  console.log('Query received:', query);
  
  res.json({
    success: true,
    retrievedContext: 'Test context from Ambo University knowledge base',
    sources: [{ type: 'test', score: 1.0 }],
    message: 'This is a test response. RAG system will be initialized on first real query.',
    query: query
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Hiriya RAG Server',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      query: 'POST /api/rag/query'
    },
    university: 'Ambo University, Ethiopia'
  });
});

// Railway needs 0.0.0.0, not localhost
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌐 Public URL: Will be provided by Railway`);
  console.log(`📡 Health endpoint: /api/health`);
});