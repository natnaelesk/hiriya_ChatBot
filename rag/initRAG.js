// rag/initRAG.js
import { rag } from './index.js';

// Initialize on startup
export async function initializeRAG() {
  try {
    await rag.init();
    console.log('✅ RAG system ready');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize RAG:', error);
    return false;
  }
}