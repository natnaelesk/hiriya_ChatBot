/* eslint-disable no-unused-vars */
// utils/localSearch.js - UPDATED with better classification
import knowledge from "../data/knowledge.json";
import locations from "../data/locations.json";

// Enhanced normalization
const normalize = (text) => {
  if (!text) return '';
  
  let normalized = text.toLowerCase()
    .replace(/[^\w\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalized;
};

// Smart query classifier
function classifyQuery(query) {
  const normQuery = normalize(query);
  
  // Direct location requests
  const locationPatterns = [
    /where (is|are) (the )?(.+)/i,
    /(location|address|map|directions|find|locate) (of|for|to) (.+)/i,
    /how (to|do I) get (to|at) (.+)/i,
    /(show|give) me (the )?(location|directions|map) (of|for|to) (.+)/i,
    /(i need|i want|looking for) (the )?(location|directions) (to|of|for) (.+)/i
  ];
  
  // General information requests (NOT direct location)
  const infoPatterns = [
    /(tell me|what is|what are|describe|explain|information about|details about|can you tell me about|could you tell me about) (.+)/i,
    /how (is|are) (the )?(.+)/i,
    /(give me|provide) (information|details) (about|on) (.+)/i,
    /i (want|would like) (to know|information) (about|on) (.+)/i
  ];
  
  // Check for location patterns
  for (const pattern of locationPatterns) {
    if (pattern.test(query)) {
      return 'location';
    }
  }
  
  // Check for information patterns
  for (const pattern of infoPatterns) {
    if (pattern.test(query)) {
      return 'information';
    }
  }
  
  // Default to information
  return 'information';
}

// Check if query should get direct location response
const needsDirectLocationResponse = (query) => {
  const classification = classifyQuery(query);
  
  // Only return direct location for explicit location requests
  return classification === 'location';
};

// Enhanced knowledge search
export function searchKnowledgeBase(userMessage) {
  const normMsg = normalize(userMessage);
  
  // Extract topic from general questions
  let searchTopic = normMsg;
  
  // Remove common question prefixes
  const prefixes = [
    'tell me about ',
    'what is ',
    'what are ',
    'can you tell me about ',
    'information about ',
    'details about ',
    'explain ',
    'describe ',
    'how is ',
    'how are '
  ];
  
  for (const prefix of prefixes) {
    if (normMsg.startsWith(prefix)) {
      searchTopic = normMsg.slice(prefix.length).trim();
      break;
    }
  }
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const item of knowledge) {
    let score = 0;
    
    // Check topic match
    const normTopic = normalize(item.topic);
    if (searchTopic.includes(normTopic) || normTopic.includes(searchTopic)) {
      score += 50;
    }
    
    // Check question matches
    for (const question of item.questions) {
      const normQuestion = normalize(question);
      if (normMsg.includes(normQuestion) || normQuestion.includes(normMsg)) {
        score += 40;
        break;
      }
    }
    
    // Check word overlap
    const itemWords = new Set([...normalize(item.topic).split(' '), ...item.questions.flatMap(q => normalize(q).split(' '))]);
    const queryWords = new Set(normMsg.split(' ').filter(w => w.length > 2));
    
    const overlappingWords = [...itemWords].filter(word => [...queryWords].some(qWord => 
      qWord.includes(word) || word.includes(qWord)
    ));
    
    score += overlappingWords.length * 10;
    
    if (score > highestScore && score > 20) {
      highestScore = score;
      bestMatch = item.answer;
    }
  }
  
  return bestMatch;
}

// Enhanced location search - now returns data, not formatted responses
export function searchLocations(userMessage) {
  const normMsg = normalize(userMessage);
  
  // Check if this is a direct location request
  const isDirectLocationRequest = needsDirectLocationResponse(userMessage);
  
  // Find matching campus
  for (const campusObj of locations) {
    const campusName = Object.keys(campusObj)[0];
    const campus = campusObj[campusName];
    
    // Check campus aliases
    for (const alias of campus.name) {
      const normAlias = normalize(alias);
      
      if (normMsg.includes(normAlias) || normAlias.includes(normMsg.split(' ')[0])) {
        // For direct location requests, find specific place
        if (isDirectLocationRequest) {
          // Find specific place mentioned
          for (const place in campus.map) {
            const normPlace = normalize(place);
            if (normMsg.includes(normPlace)) {
              // Return formatted location data for direct response
              return `${place} → ${campus.map[place]}`;
            }
          }
          
          // If no specific place but direct location request, ask for clarification
          const places = Object.keys(campus.map).join(', ');
          return `Which specific place in ${campusName} are you looking for? Available locations: ${places}`;
        } else {
          // For general questions, return campus info for context
          const placeCount = Object.keys(campus.map).length;
          return `Campus: ${campusName}\nAvailable locations: ${placeCount} places including cafe, library, dorm, etc.\nThis campus is also known as: ${campus.name.join(', ')}`;
        }
      }
    }
    
    // Check for specific places even without campus name
    for (const place in campus.map) {
      const normPlace = normalize(place);
      if (normMsg.includes(normPlace) && isDirectLocationRequest) {
        return `${place} (${campusName}) → ${campus.map[place]}`;
      }
    }
  }
  
  return null;
}