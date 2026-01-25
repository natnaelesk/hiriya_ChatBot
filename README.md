# 🤖 Hiriya Chatbot - Frontend

<div align="center">

![Hiriya Chatbot Hero](./LuminaAI/backend/hero.png)

[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Llama-orange?style=for-the-badge)](https://groq.com/)

**Intelligent AI Chatbot Frontend for Ambo University**

Built with **React 19** • Powered by **RAG** • Enhanced with **Text-to-Speech** • Integrated **Interactive Maps**

[🌐 Live Demo](https://hiriya-chat-bot.vercel.app) • [🔌 Backend API](https://github.com/natnaelesk/hiriya_Chatbot_Backend) • [📚 Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎨 Screenshots & Demo](#-screenshots--demo)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔌 API Integration](#-api-integration)
- [🎯 Key Features Explained](#-key-features-explained)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Features

### 🧠 **Intelligent RAG-Powered Chat**
- **Semantic Search** - Retrieves contextually relevant information from Ambo University knowledge base
- **Hybrid Search** - Combines vector similarity and keyword matching for accurate results
- **Context-Aware Responses** - Maintains conversation history for coherent interactions
- **Smart Query Classification** - Automatically detects location queries vs. information requests

### 🎨 **Beautiful Modern UI**
- **Dark/Light Mode** - Seamless theme switching with persistent preferences
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Typing indicators, message streaming, and transitions
- **Gradient Design** - Modern glassmorphism effects and gradient backgrounds
- **Accessible** - Keyboard navigation and screen reader support

### 🗺️ **Interactive Maps**
- **Leaflet Integration** - Interactive satellite and street maps
- **Location Detection** - Automatically extracts coordinates from Google Maps URLs
- **Campus-Aware** - Smart campus detection (Main, Techno, Guder, Woliso)
- **Popup Markers** - Detailed location information with direct Google Maps links

### 🔊 **Text-to-Speech**
- **ElevenLabs Integration** - High-quality AI voice (Brian) for responses
- **Browser Fallback** - Automatic fallback to native Web Speech API
- **Play/Stop Controls** - Simple audio controls for each message
- **Loading States** - Visual feedback during audio generation

### 💬 **Advanced Chat Features**
- **Message Streaming** - Real-time character-by-character message display
- **Markdown Support** - Rich text formatting with **bold**, *italic*, and lists
- **Link Detection** - Automatic URL detection and clickable links
- **Message Persistence** - LocalStorage for conversation history
- **Token Limit Management** - Smart warnings for long conversations
- **New Chat Function** - Easy conversation reset with context clearing

### 📱 **Mobile Optimized**
- **Touch-Friendly** - Large tap targets and swipe gestures
- **Mobile Menu** - Collapsible navigation with burger menu
- **Floating Actions** - Quick access buttons for mobile users
- **Message Counter** - Visual indicator of conversation length

### 🎯 **University-Specific Features**
- **Campus Information** - Detailed info about all 4 campuses
- **Academic Programs** - Information about departments and courses
- **Location Services** - Find buildings, offices, and facilities
- **Admission Info** - Guidance on enrollment procedures
- **Student Services** - Information about university services

---

## 🎨 Screenshots & Demo

### Live Application
🌐 **[Try Hiriya Chatbot Now](https://hiriya-chat-bot.vercel.app)**

### Key Features Showcase

**💬 Chat Interface**
- Clean, modern chat bubbles with gradient designs
- Real-time typing indicators
- Message timestamps and status indicators
- Audio playback controls

**🗺️ Interactive Maps**
- Satellite view with location markers
- Campus-aware location detection
- Direct Google Maps integration

**🌓 Theme Switching**
- Seamless dark/light mode toggle
- Persistent theme preferences
- Smooth transitions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   App.jsx    │  │   Navbar     │  │  Components   │    │
│  │  (Main App)  │  │  (Header)   │  │  (Chat UI)    │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘    │
│         │                                      │            │
│         ▼                                      ▼            │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Services Layer                           │    │
│  │  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │ chatService  │  │  ttsService   │            │    │
│  │  │  (RAG API)   │  │ (ElevenLabs)  │            │    │
│  │  └──────┬───────┘  └───────────────┘            │    │
│  └─────────┼────────────────────────────────────────┘    │
│            │                                               │
└────────────┼───────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend RAG API (Separate Repo)                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Express.js  │  │  RAG System  │  │  Vector      │    │
│  │   Server     │  │  (@xenova)   │  │   Store      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │            │
│         └─────────────────┼──────────────────┘            │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │  Knowledge Base │                       │
│                  │   (JSON Data)   │                       │
│                  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │  Groq API    │  │  ElevenLabs   │                      │
│  │  (LLM)       │  │  (TTS)        │                      │
│  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/natnaelesk/hiriya_ChatBot.git
   cd hiriya_ChatBot/LuminaAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `LuminaAI` directory:
   ```env
   # RAG Backend API URL
   VITE_RAG_API_URL=https://hiriyachatbotbackend-production.up.railway.app
   
   # Groq API Key (for LLM)
   VITE_GROQ_API_KEY=your_groq_api_key_here
   
   # Firebase Configuration (optional)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 📦 Installation

### Step-by-Step Setup

#### 1. **Clone Repository**
```bash
git clone https://github.com/natnaelesk/hiriya_ChatBot.git
cd hiriya_ChatBot/LuminaAI
```

#### 2. **Install Dependencies**
```bash
npm install
```

This will install all required packages:
- React 19.2.0
- Vite 7.2.4
- TailwindCSS 4.1.17
- Leaflet & React-Leaflet (for maps)
- Firebase (for future features)
- And more...

#### 3. **Environment Configuration**

Create `.env` file:
```env
VITE_RAG_API_URL=https://hiriyachatbotbackend-production.up.railway.app
VITE_GROQ_API_KEY=your_groq_api_key
```

#### 4. **Run Development Server**
```bash
npm run dev
```

#### 5. **Build for Production**
```bash
npm run build
npm run preview  # Preview production build
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_RAG_API_URL` | Backend RAG API endpoint | Yes | Railway URL |
| `VITE_GROQ_API_KEY` | Groq API key for LLM | Yes | - |
| `VITE_FIREBASE_API_KEY` | Firebase API key | No | - |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No | - |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | No | - |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage | No | - |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | No | - |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | No | - |

### Customization

#### **Theme Colors**
Edit `src/index.css` or component files to customize:
- Primary colors (blue/amber gradient)
- Dark mode colors
- Chat bubble styles

#### **API Endpoints**
Modify `src/services/chatService.js`:
```javascript
const RAG_API_URL = 'your-backend-url';
```

#### **TTS Voice**
Edit `src/services/ttsService.js`:
```javascript
this.BRIAN_VOICE_ID = "your-voice-id";
```

---

## 🛠️ Tech Stack

### Frontend Framework

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Library | 19.2.0 |
| **Vite** | Build Tool & Dev Server | 7.2.4 |
| **TailwindCSS** | Utility-First CSS | 4.1.17 |
| **React Router** | Client-Side Routing | (Future) |

### UI Components & Libraries

| Library | Purpose |
|---------|---------|
| **Leaflet** | Interactive Maps |
| **React-Leaflet** | React bindings for Leaflet |
| **ElevenLabs** | Text-to-Speech API |
| **Firebase** | Backend services (future) |

### AI & ML Integration

| Service | Purpose |
|---------|---------|
| **Groq API** | LLM (Llama 3.1 8B Instant) |
| **RAG Backend** | Semantic search & context retrieval |
| **ElevenLabs** | High-quality TTS |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Vite HMR** | Hot Module Replacement |
| **PostCSS** | CSS processing |

---

## 📁 Project Structure

```
pdf-chatbot/
│
├── 📂 LuminaAI/                    # Main frontend application
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/          # React components
│   │   │   ├── ChatInput.jsx      # Message input with auto-resize
│   │   │   ├── ChatMessages.jsx   # Message display with streaming
│   │   │   ├── MapBox.jsx         # Interactive map component
│   │   │   └── Navbar.jsx         # Navigation bar with theme toggle
│   │   │
│   │   ├── 📂 services/           # Business logic
│   │   │   ├── chatService.js     # RAG API integration
│   │   │   ├── prompts.js         # System prompts & formatting
│   │   │   └── ttsService.js      # Text-to-speech service
│   │   │
│   │   ├── 📂 utils/              # Utility functions
│   │   │   ├── localSearch.js     # Local knowledge search
│   │   │   └── normalizer.js     # Text normalization
│   │   │
│   │   ├── 📂 firebase/           # Firebase configuration
│   │   │   └── config.js          # Firebase setup
│   │   │
│   │   ├── 📂 assets/             # Static assets
│   │   │   └── ambo-logo.png      # University logo
│   │   │
│   │   ├── App.jsx                # Main application component
│   │   ├── main.jsx               # Application entry point
│   │   └── index.css              # Global styles
│   │
│   ├── 📂 public/                 # Public assets
│   │   └── favicon.ico            # Site favicon
│   │
│   ├── 📂 backend/                # Backend code (separate repo)
│   │   ├── 📂 rag/                # RAG system modules
│   │   ├── 📂 data/               # Knowledge base data
│   │   ├── server.js              # Express server
│   │   └── hero.png               # Hero image
│   │
│   ├── package.json               # Dependencies & scripts
│   ├── vite.config.js             # Vite configuration
│   ├── index.html                 # HTML template
│   └── README.md                  # Frontend-specific docs
│
└── README.md                       # This file (main project README)
```

---

## 🔌 API Integration

### Backend RAG API

The frontend connects to a separate backend repository:

🔗 **[Backend Repository](https://github.com/natnaelesk/hiriya_Chatbot_Backend)**

**API Endpoints:**

#### 1. **Query Endpoint**
```javascript
POST https://hiriyachatbotbackend-production.up.railway.app
Content-Type: application/json

{
  "query": "What programs are available at Woliso Campus?"
}
```

**Response:**
```json
{
  "retrievedContext": "...",
  "sources": [...],
  "stats": {...}
}
```

#### 2. **Health Check**
```javascript
GET https://hiriyachatbotbackend-production.up.railway.app/api/health
```

### Groq LLM API

Used for generating responses from retrieved context:

```javascript
POST https://api.groq.com/openai/v1/chat/completions
Authorization: Bearer ${VITE_GROQ_API_KEY}

{
  "model": "llama-3.1-8b-instant",
  "messages": [...],
  "temperature": 0.3
}
```

### ElevenLabs TTS API

Text-to-speech conversion:

```javascript
POST https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}
xi-api-key: ${API_KEY}

{
  "text": "...",
  "model_id": "eleven_multilingual_v2"
}
```

---

## 🎯 Key Features Explained

### 1. **RAG-Powered Chat**

The chat system uses Retrieval-Augmented Generation:
1. User sends a message
2. Frontend queries RAG backend API
3. Backend retrieves relevant context from knowledge base
4. Context is sent to Groq LLM with system prompt
5. LLM generates response using retrieved context
6. Response is streamed to user

**File:** `src/services/chatService.js`

### 2. **Message Streaming**

Messages appear character-by-character for better UX:

```javascript
// Simulated streaming effect
const interval = setInterval(() => {
  setStreamingText(message.slice(0, i++));
}, 5);
```

**File:** `src/components/ChatMessages.jsx`

### 3. **Interactive Maps**

Maps are automatically displayed when location queries are detected:

```javascript
// Extract coordinates from Google Maps URL
const coords = extractCoordinatesFromUrl(mapUrl);
```

**File:** `src/components/MapBox.jsx`

### 4. **Theme Management**

Dark/light mode with localStorage persistence:

```javascript
const [isDarkMode, setIsDarkMode] = useState(() => {
  return localStorage.getItem('theme') === 'dark';
});
```

**File:** `src/App.jsx`

### 5. **Token Limit Management**

Warns users after 15 messages to start a new chat:

```javascript
if (messageCount >= 15) {
  setShowTokenWarning(true);
}
```

**File:** `src/App.jsx`

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd LuminaAI
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all `VITE_*` variables

### Manual Build & Deploy

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Preview locally**
   ```bash
   npm run preview
   ```

3. **Deploy `dist/` folder** to your hosting service

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `VITE_RAG_API_URL`
- `VITE_GROQ_API_KEY`
- `VITE_FIREBASE_*` (if using Firebase)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   git fork https://github.com/natnaelesk/hiriya_ChatBot.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow ESLint rules
- **Components**: Use functional components with hooks
- **Styling**: Use TailwindCSS utility classes
- **Testing**: Test in multiple browsers
- **Documentation**: Update README for new features

---

## 📊 Project Status

- ✅ **Frontend UI** - Fully implemented
- ✅ **RAG Integration** - Connected to backend API
- ✅ **Text-to-Speech** - ElevenLabs integration working
- ✅ **Interactive Maps** - Leaflet integration complete
- ✅ **Dark/Light Mode** - Theme switching functional
- ✅ **Mobile Responsive** - Optimized for all devices
- ✅ **Message Streaming** - Real-time display working
- ✅ **Deployment** - Live on Vercel
- 🔄 **Firebase Integration** - In progress
- 🔄 **User Authentication** - Planned
- 🔄 **Chat History** - Cloud sync planned

---

## 🎓 About Ambo University

Ambo University is a public national university located in Ambo town, Oromia Region, Ethiopia. Established officially on May 11, 2011, with roots dating back to 1947 as an agricultural school.

**Key Statistics:**
- 📚 **25,150 students** (19,000 undergraduates, 6,000 postgraduates, 150 doctoral)
- 👨‍🏫 **1,800 academic staff**
- 🏛️ **4 main campuses** (Main, Techno, Guder, Woliso)
- 📍 **114 km west of Addis Ababa**

---

## 📝 License

This project is part of the Hiriya Chatbot initiative for Ambo University, created by the developer's club team.

---

## 🔗 Links

### Frontend
- 🌐 **Live Application**: [https://hiriya-chat-bot.vercel.app](https://hiriya-chat-bot.vercel.app)
- 📦 **Frontend Repository**: [https://github.com/natnaelesk/hiriya_ChatBot](https://github.com/natnaelesk/hiriya_ChatBot)

### Backend
- 🔌 **Backend API**: [https://hiriyachatbotbackend-production.up.railway.app](https://hiriyachatbotbackend-production.up.railway.app)
- 📦 **Backend Repository**: [https://github.com/natnaelesk/hiriya_Chatbot_Backend](https://github.com/natnaelesk/hiriya_Chatbot_Backend)
- 🏥 **Health Check**: [https://hiriyachatbotbackend-production.up.railway.app/api/health](https://hiriyachatbotbackend-production.up.railway.app/api/health)

### Documentation
- 📚 **API Documentation**: See [Backend README](https://github.com/natnaelesk/hiriya_Chatbot_Backend#-api-documentation)
- 🎨 **UI Components**: See `src/components/` directory
- 🔧 **Services**: See `src/services/` directory

### External Services
- 🤖 **Groq API**: [https://groq.com](https://groq.com)
- 🔊 **ElevenLabs**: [https://elevenlabs.io](https://elevenlabs.io)
- 🗺️ **Leaflet Maps**: [https://leafletjs.com](https://leafletjs.com)

---

## 🙏 Acknowledgments

- **Ambo University** - For providing the knowledge base and support
- **Developer's Club** - For creating and maintaining this project
- **Open Source Community** - For amazing tools and libraries

---

<div align="center">

**Built with ❤️ for Ambo University**

[⬆ Back to Top](#-hiriya-chatbot---frontend)

---

⭐ **Star this repo if you find it helpful!** ⭐

</div>
