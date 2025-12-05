// rag/embedder.js
import { pipeline } from "@xenova/transformers";

class Embedder {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('Loading embedding model...');
    this.model = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { quantized: false } // Faster with quantization
    );
    this.initialized = true;
    console.log('Embedding model loaded');
  }

  async embed(text) {
    if (!this.initialized) await this.init();
    
    try {
      const result = await this.model(text, {
        pooling: 'mean',
        normalize: true
      });
      
      // Convert tensor to array
      return Array.from(result.data);
    } catch (error) {
      console.error('Embedding error:', error);
      // Return a zero vector as fallback
      return new Array(384).fill(0);
    }
  }

  // Batch embed for efficiency
  async embedBatch(texts) {
    if (!this.initialized) await this.init();
    
    const embeddings = [];
    for (const text of texts) {
      const embedding = await this.embed(text);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}

// Singleton instance
export const embedder = new Embedder();