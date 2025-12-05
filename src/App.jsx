// App.jsx - Updated with context management
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import { sendMessageToAPI, clearChatContext } from './services/chatService';
import 'leaflet/dist/leaflet.css';

// Token limit warning component
const TokenLimitWarning = ({ onNewChat, onContinue, isDarkMode }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-black/80' : 'bg-white/80'
    }`}>
      <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl ${
        isDarkMode 
          ? 'bg-[#1a1a1a] border border-[#333333] text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
            isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Conversation Limit Reached</h3>
          <p className="text-sm opacity-80 mb-6">
            The current conversation has become too long for optimal performance. 
            Starting a new chat will provide better responses.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onNewChat}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Start New Chat (Recommended)
          </button>
          
          <button
            onClick={onContinue}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              isDarkMode
                ? 'bg-[#2a2a2a] hover:bg-[#333333] text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Continue Anyway
          </button>
        </div>
        
        <p className="text-xs text-center mt-4 opacity-60">
          Note: Continuing with long conversations may reduce response quality
        </p>
      </div>
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : getWelcomeMessage();
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatContainerRef = useRef(null);

  // Welcome message
  function getWelcomeMessage() {
    return [
      { 
        id: 1, 
        text: `👋 **Hello! I'm Lumina**\n\nYour dedicated AI assistant for **Ambo University**. I can help you with:\n\n• Campus locations and directions\n• Academic programs and departments\n• Admission procedures\n• University services and facilities\n• Campus policies and student life\n\nWhat would you like to know about Ambo University today?`, 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  // Initialize
  useEffect(() => {
    const messageCount = messages.filter(m => m.isUser).length;
    setMessageCount(messageCount);
    
    // Check if we should show token warning (after 15 user messages)
    if (messageCount >= 15 && !showTokenWarning) {
      setShowTokenWarning(true);
    }
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle New Chat with context clearing
  const handleNewChat = () => {
    if (messages.length > 1 && !window.confirm('Start a new chat? This will clear the current conversation.')) {
      return;
    }
    
    clearChatContext();
    setMessages(getWelcomeMessage());
    localStorage.removeItem('chatMessages');
    setShowTokenWarning(false);
    setMessageCount(0);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    try {
      const aiResponse = await sendMessageToAPI(message);
      
      // Check for token limit warning in response
      if (aiResponse.includes('context limit') || aiResponse.includes('Conversation Too Long')) {
        setShowTokenWarning(true);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `⚠️ **Technical Issue**\n\nI apologize, but I'm having trouble responding right now. Please try again in a moment.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Continue with conversation despite token warning
  const handleContinueConversation = () => {
    setShowTokenWarning(false);
  };

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`fixed inset-0 overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}>
        
        {/* Token Limit Warning Modal */}
        {showTokenWarning && (
          <TokenLimitWarning 
            onNewChat={handleNewChat}
            onContinue={handleContinueConversation}
            isDarkMode={isDarkMode}
          />
        )}
        
        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Navbar 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            toggleMobileMenu={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
            onNewChat={handleNewChat}
            messageCount={messageCount}
          />
        </div>

        {/* Chat Messages Area */}
        <ChatMessages 
          messages={messages}
          chatContainerRef={chatContainerRef}
          isDarkMode={isDarkMode}
          isTyping={isTyping}
        />

        {/* Chat Input Area */}
        <ChatInput 
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          isDarkMode={isDarkMode}
          disabled={showTokenWarning}
        />

        {/* Message Counter (mobile) */}
        <div className="absolute bottom-24 left-4 md:hidden">
          <div className={`text-xs px-3 py-2 rounded-full ${
            isDarkMode 
              ? 'bg-[#2a2a2a] text-gray-400' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {messageCount} messages
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="absolute bottom-24 right-4 md:hidden">
          <button
            onClick={handleNewChat}
            className={`p-4 rounded-full shadow-lg transition-all ${
              isDarkMode
                ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333] border border-[#444444]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            title="New Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;