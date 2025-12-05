// rag/index.js
import { loadAndChunkDocuments } from './documentLoader.js';
import { vectorStore } from './vectorStore.js';

class RAGSystem {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('Initializing RAG system...');
    
    // Load and chunk documents
    const chunks = loadAndChunkDocuments();
    
    // Add to vector store
    await vectorStore.addChunks(chunks);
    
    this.initialized = true;
    console.log('RAG system initialized');
  }

  async retrieveContext(query, topK = 5) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      // Use hybrid search for better results
      const results = await vectorStore.hybridSearch(query, topK);
      
      if (results.length === 0) {
        return {
          context: 'No relevant information found in university database.',
          sources: []
        };
      }

      // Format context with sources
      const context = results.map(result => 
        `[Source: ${result.chunk.metadata.source} | Topic: ${result.chunk.metadata.topic || 'General'}]\n${result.chunk.text}`
      ).join('\n\n---\n\n');

      const sources = results.map(r => ({
        type: r.chunk.metadata.type,
        topic: r.chunk.metadata.topic,
        campus: r.chunk.metadata.campus,
        place: r.chunk.metadata.place,
        score: r.score.toFixed(3)
      }));

      return {
        context,
        sources
      };
    } catch (error) {
      console.error('Retrieval error:', error);
      return {
        context: 'Error retrieving information. Please try again.',
        sources: []
      };
    }
  }

  async query(query) {
    const { context, sources } = await this.retrieveContext(query);
    
    return {
      retrievedContext: context,
      sources,
      stats: vectorStore.getStats()
    };
  }

  // ADD THIS METHOD INSIDE THE CLASS (not outside!)
  async debugQuery(query) {
    const startTime = Date.now();
    const results = await this.retrieveContext(query);
    const endTime = Date.now();
    
    return {
      query,
      responseTime: `${endTime - startTime}ms`,
      sources: results.sources,
      chunkCount: results.sources.length,
      contextPreview: results.context.substring(0, 200) + '...'
    };
  }
}

// Singleton instance
export const rag = new RAGSystem();

// Optional: Export a debug function
export async function debugRAGQuery(query) {
  return await rag.debugQuery(query);
}