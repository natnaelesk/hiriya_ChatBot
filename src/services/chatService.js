// services/chatService.js - Updated to use RAG API
import { SYSTEM_PROMPT, formatLocationResponse } from './prompts.js';

const getRAGApiUrl = () => {
  // Use environment variable if set (for Vercel / local)
  if (import.meta.env.VITE_RAG_API_URL) {
    return import.meta.env.VITE_RAG_API_URL;
  }

  // Default to Railway deployment
  return 'https://hiriyachatbotbackend-production.up.railway.app';
};

const RAG_API_URL = getRAGApiUrl();
console.log('Hiriya using RAG API:', RAG_API_URL);


// Simple conversation memory
const conversationHistory = [];
const MAX_HISTORY = 10;

function addToHistory(role, content) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > MAX_HISTORY * 2) {
    conversationHistory.splice(0, conversationHistory.length - MAX_HISTORY);
  }
}

function getRecentHistory() {
  return conversationHistory.slice(-MAX_HISTORY);
}

// Check for greeting/farewell
function checkSpecialCases(message) {
  const msg = message.toLowerCase().trim();
  
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const farewells = ['bye', 'goodbye', 'see you', 'farewell', 'thanks bye'];
  const thanks = ['thank', 'thanks', 'appreciate'];
  
  if (greetings.some(g => msg.includes(g))) {
    return "Hello! I'm Hiriya, your Ambo University assistant. How can I help you today? 😊";
  }
  
  if (thanks.some(t => msg.includes(t))) {
    return "You're welcome! Is there anything else you'd like to know about Ambo University?";
  }
  
  if (farewells.some(f => msg.includes(f))) {
    return "Goodbye! Have a wonderful day at Ambo University. Remember, I'm always here if you need help! 🙏";
  }
  
  if (msg.includes('who are you') || msg.includes('what are you')) {
    return "I'm Hiriya, the AI assistant for Ambo University in Ethiopia, created by the developer's club team to help students with information about the university!";
  }
  
  return null;
}

// Check if it's a direct map request
function isDirectMapQuery(query) {
  const patterns = [
    /where (is|are) (the )?(.+)/i,
    /(location|address|map|directions) (of|for|to) (.+)/i,
    /how (to|do i) get (to|at) (.+)/i,
    /(show|give) me (the )?(location|directions|map) (of|for|to) (.+)/i
  ];
  
  return patterns.some(pattern => pattern.test(query));
}

// Fetch from RAG API
async function fetchFromRAG(query) {
  try {
    const response = await fetch(RAG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`RAG API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from RAG:', error);
    return null;
  }
}

// Main chat service
export const sendMessageToAPI = async (message) => {
  const msg = message.trim();
  
  // Check for special cases first
  const specialResponse = checkSpecialCases(msg);
  if (specialResponse) {
    addToHistory('user', msg);
    addToHistory('assistant', specialResponse);
    return specialResponse;
  }
  
  // Check if it's a direct map query
  const isDirectMap = isDirectMapQuery(msg);
  
  try {
    // Retrieve context using RAG API
    const ragResult = await fetchFromRAG(msg);
    
    if (!ragResult) {
      throw new Error('Failed to get context from RAG');
    }
    
    const { retrievedContext, sources } = ragResult;
    
    // Prepare messages for LLM
    const messages = [];
    
    // Add system prompt with context
    const systemMessage = SYSTEM_PROMPT
      .replace('{{CONTEXT}}', retrievedContext)
      .replace('{{QUERY}}', msg);
    
    messages.push({ role: 'system', content: systemMessage });
    
    // Add conversation history
    const history = getRecentHistory();
    messages.push(...history);
    
    // Add current message
    messages.push({ role: 'user', content: msg });
    
    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // or 'mixtral-8x7b-32768'
        messages: messages,
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    let aiResponse = data.choices[0].message.content.trim();
    
    // If it's a direct map query and we found a specific location in context
    if (isDirectMap && sources && sources.some(s => s.type === 'map_location')) {
      // Try to extract location link from context
      const locationMatch = retrievedContext.match(/Google Maps Link: (https:\/\/[^\s]+)/);
      if (locationMatch) {
        const placeMatch = retrievedContext.match(/Place: ([^\n]+)/);
        if (placeMatch) {
          const place = placeMatch[1];
          const mapLink = locationMatch[1];
          aiResponse = formatLocationResponse(place, mapLink);
        }
      }
    }
    // Clean up any stray </map> in the AI response
aiResponse = aiResponse.replace(/<\/map>/g, '');
console.log('AI Response (cleaned):', aiResponse);

    // Update history
    addToHistory('user', msg);
    addToHistory('assistant', aiResponse);
    
    return aiResponse;
    
  } catch (error) {
    console.error('Chat service error:', error);
    
    return "I apologize, but I'm having trouble accessing the university database right now. Please try again in a moment, or contact the university directly for urgent matters.";
  }
};

// Clear conversation
export const clearChatContext = () => {
  conversationHistory.length = 0;
  return "Conversation cleared! I'm ready to help with your questions about Ambo University. 😊";
};