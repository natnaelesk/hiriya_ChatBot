/* eslint-disable no-undef */
// rag/documentLoader.js - FIXED PATHS
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function loadAndChunkDocuments() {
  const chunks = [];
  
  // Get the correct paths - data is in ../data/ from rag/
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  
  // For Windows, we need to handle the path properly
  let knowledgePath, locationsPath;
  
  try {
    // Try relative path first
    knowledgePath = path.join(process.cwd(), 'src', 'data', 'knowledge.json');
    locationsPath = path.join(process.cwd(), 'src', 'data', 'locations.json');
    
    console.log('Looking for files at:');
    console.log('Knowledge:', knowledgePath);
    console.log('Locations:', locationsPath);
    
    // Check if files exist
    if (!fs.existsSync(knowledgePath)) {
      console.error('Knowledge file not found at:', knowledgePath);
      // Try alternative path
      knowledgePath = path.join(__dirname, '..', 'data', 'knowledge.json');
      console.log('Trying alternative:', knowledgePath);
    }
    
    if (!fs.existsSync(locationsPath)) {
      console.error('Locations file not found at:', locationsPath);
      // Try alternative path
      locationsPath = path.join(__dirname, '..', 'data', 'locations.json');
      console.log('Trying alternative:', locationsPath);
    }
    
  } catch (error) {
    console.error('Path error:', error);
    // Fallback to relative path
    knowledgePath = path.join(__dirname, '..', 'data', 'knowledge.json');
    locationsPath = path.join(__dirname, '..', 'data', 'locations.json');
  }
  
  // Load knowledge.json
  const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
  
  // Process knowledge.json
  for (const item of knowledge) {
    // Create chunks for each topic
    chunks.push({
      id: uuidv4(),
      text: `Topic: ${item.topic}\n\nAnswer: ${item.answer}\n\nSynonyms: ${item.synonyms?.join(', ')}`,
      metadata: {
        type: 'knowledge',
        topic: item.topic,
        source: 'knowledge.json'
      }
    });
    
    // Also create chunks for each question (for better retrieval)
    for (const question of item.questions) {
      chunks.push({
        id: uuidv4(),
        text: `Question: ${question}\n\nAnswer: ${item.answer}`,
        metadata: {
          type: 'question',
          topic: item.topic,
          source: 'knowledge.json'
        }
      });
    }
  }
  
  // Process locations.json
  for (const campusObj of locations) {
    const campusName = Object.keys(campusObj)[0];
    const campus = campusObj[campusName];
    
    // Campus overview chunk
    chunks.push({
      id: uuidv4(),
      text: `Campus: ${campusName}\nAliases: ${campus.name?.join(', ')}\nGate Closing: ${campus.gate_closing_time || 'Not specified'}\nDorm Types: ${campus.dorm_types?.join(', ')}\nUtilities: ${campus.utilities?.join(', ')}`,
      metadata: {
        type: 'location',
        campus: campusName,
        source: 'locations.json'
      }
    });
    
    // Individual location chunks with maps
    if (campus.map) {
      for (const [place, link] of Object.entries(campus.map)) {
        if (link && link !== '...') {
          chunks.push({
            id: uuidv4(),
            text: `Place: ${place}\nCampus: ${campusName}\nGoogle Maps Link: ${link}\nAddress: See link for exact location`,
            metadata: {
              type: 'map_location',
              campus: campusName,
              place: place,
              source: 'locations.json'
            }
          });
        }
      }
    }
  }
  
  console.log(`Loaded ${chunks.length} chunks from documents`);
  return chunks;
}