// server.js - FIXED for Railway
import express from 'express';
import cors from 'cors';
import { rag } from './rag/index.js';

const app = express();

// Allow your Vercel frontend and local development
const allowedOrigins = [
  'https://hiriya-chat-bot.vercel.app',
  'https://rag-server-production.up.railway.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    console.log('Request from origin:', origin);
    
    if (allowedOrigins.some(allowed => 
      origin === allowed || origin.includes('vercel.app') || origin.includes('railway.app')
    )) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// Initialize RAG once
let ragInitialized = false;

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    console.log('Health check requested');
    if (!ragInitialized) {
      console.log('Initializing RAG...');
      await rag.init();
      ragInitialized = true;
      console.log('RAG initialized successfully');
    }
    res.json({ 
      status: 'ok', 
      ragInitialized,
      timestamp: new Date().toISOString(),
      message: 'Hiriya RAG Server for Ambo University',
      endpoints: {
        query: 'POST /api/rag/query',
        health: 'GET /api/health'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'error',
      ragInitialized 
    });
  }
});

// Query endpoint
app.post('/api/rag/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    console.log('📨 RAG Query received:', query?.substring(0, 100));
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string',
        example: { query: "What is Ambo University?" }
      });
    }
    
    if (!ragInitialized) {
      console.log('🚀 Initializing RAG for first query...');
      await rag.init();
      ragInitialized = true;
      console.log('✅ RAG initialized');
    }
    
    console.log('🔍 Searching knowledge base...');
    const result = await rag.query(query);
    
    console.log(`✅ Found ${result.sources?.length || 0} relevant sources`);
    
    res.json({
      success: true,
      ...result,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ RAG query error:', error);
    res.status(500).json({ 
      error: error.message,
      success: false,
      suggestion: 'Please try a different question or try again later'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Hiriya RAG Server',
    university: 'Ambo University, Ethiopia',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      query: 'POST /api/rag/query',
    },
    frontend: 'https://hiriya-chat-bot.vercel.app',
    documentation: 'Contact developer club for support'
  });
});

// Handle preflight requests
app.options('*', cors());

// CRITICAL FIX: Railway provides PORT environment variable
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Railway needs this, not 'localhost'

app.listen(PORT, HOST, () => {
  console.log(`✅ Hiriya RAG Server running on ${HOST}:${PORT}`);
  console.log(`🌐 Public URL: https://rag-server-production.up.railway.app`);
  console.log(`🏥 Health: https://rag-server-production.up.railway.app/api/health`);
  console.log(`🔍 Query: POST https://rag-server-production.up.railway.app/api/rag/query`);
  console.log(`🎓 Serving: Ambo University students and staff`);
  
  // Log Railway environment info
  console.log('🚂 Railway Environment:');
  console.log('PORT:', process.env.PORT);
  console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('RAILWAY_GIT_COMMIT_SHA:', process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 8));
});