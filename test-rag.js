// test-rag.js (in project root)
import { rag } from './src/rag/index.js';

async function testRAG() {
  console.log('Testing RAG system...\n');
  
  try {
    // Initialize RAG
    await rag.init();
    
    // Test a query
    const query = "What campuses does Ambo University have?";
    console.log('Query:', query);
    
    const result = await rag.query(query);
    
    console.log('\nContext retrieved:');
    console.log(result.retrievedContext.substring(0, 500) + '...');
    
    console.log('\nSources:', result.sources);
    console.log('\nStats:', result.stats);
    
    // Test debug query
    const debug = await rag.debugQuery(query);
    console.log('\nDebug info:', debug.responseTime);
    
  } catch (error) {
    console.error('Error testing RAG:', error);
  }
}

testRAG();