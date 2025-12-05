// server.js - Simplified version
import express from 'express';
import cors from 'cors';
import { rag } from './src/rag/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize RAG once
let ragInitialized = false;

// Initialize endpoint
app.post('/api/rag/init', async (req, res) => {
  try {
    if (!ragInitialized) {
      await rag.init();
      ragInitialized = true;
      console.log('RAG initialized via API');
    }
    res.json({ success: true, message: 'RAG initialized' });
  } catch (error) {
    console.error('RAG init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query endpoint
app.post('/api/rag/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    console.log('Received query:', query);
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!ragInitialized) {
      await rag.init();
      ragInitialized = true;
    }
    
    const result = await rag.query(query);
    res.json(result);
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ragInitialized,
    timestamp: new Date().toISOString() 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ RAG API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Query endpoint: POST http://localhost:${PORT}/api/rag/query`);
});