// rag/vectorStore.js
import { embedder } from './embedder.js';

function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

class VectorStore {
  constructor() {
    this.chunks = [];
    this.embeddings = [];
    this.isIndexed = false;
  }

  async addChunks(chunks) {
    console.log(`Adding ${chunks.length} chunks to vector store...`);
    
    this.chunks = chunks;
    const texts = chunks.map(c => c.text);
    this.embeddings = await embedder.embedBatch(texts);
    this.isIndexed = true;
    
    console.log('Vector store indexed successfully');
  }

  async search(query, topK = 5) {
    if (!this.isIndexed) {
      throw new Error('Vector store not indexed');
    }

    const queryEmbedding = await embedder.embed(query);
    
    // Calculate similarity scores
    const scoredChunks = this.chunks.map((chunk, index) => ({
      chunk: chunk,
      score: cosineSimilarity(queryEmbedding, this.embeddings[index]),
      index: index
    }));

    // Sort by score (descending)
    scoredChunks.sort((a, b) => b.score - a.score);

    // Filter out very low similarity scores
    const relevantChunks = scoredChunks
      .filter(item => item.score > 0.3) // Threshold
      .slice(0, topK);

    return relevantChunks;
  }

  // Hybrid search combining vector and keyword
  async hybridSearch(query, topK = 5) {
    const vectorResults = await this.search(query, topK * 2);
    
    // Boost score for keyword matches
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    const boostedResults = vectorResults.map(result => {
      let boostedScore = result.score;
      const text = result.chunk.text.toLowerCase();
      
      // Boost for exact keyword matches
      for (const term of queryTerms) {
        if (text.includes(term)) {
          boostedScore += 0.2; // Boost factor
        }
      }
      
      return {
        ...result,
        score: Math.min(boostedScore, 1.0) // Cap at 1.0
      };
    });

    // Resort and take topK
    boostedResults.sort((a, b) => b.score - a.score);
    return boostedResults.slice(0, topK);
  }

  getStats() {
    return {
      chunks: this.chunks.length,
      indexed: this.isIndexed,
      dimensions: this.embeddings[0]?.length || 0
    };
  }
}

// Singleton instance
export const vectorStore = new VectorStore();