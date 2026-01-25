import React, { useRef } from 'react';

const ChatInput = ({ message, setMessage, handleSendMessage, isDarkMode }) => {
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Custom CSS for clean design
  const customStyles = `
    /* Light Mode Container - Using the bubble gradient */
    .light-input-container {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
    
    /* Dark Mode Container - Pure black to dark gray */
    .dark-input-container {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      border: 1px solid #333333;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    
    /* Light Mode Status Bar */
    .light-status-bar {
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    
    /* Dark Mode Status Bar */
    .dark-status-bar {
      border-top: 1px solid #333333;
      background: #0a0a0a;
    }
    
    /* Active Send Button - Light (Blue gradient like light mode user bubble) */
    .light-send-active {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }
    
    .light-send-active:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    /* Active Send Button - Dark (Glassy yellow gradient) */
    .dark-send-active {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%);
      color: #000000;
      box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
      backdrop-filter: blur(10px);
    }
    
    .dark-send-active:hover {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
    }
    
    /* Inactive Send Button */
    .light-send-inactive {
      background: #f1f5f9;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
    }
    
    .dark-send-inactive {
      background: rgba(55, 55, 55, 0.5);
      color: #6b7280;
      border: 1px solid #404040;
      backdrop-filter: blur(10px);
    }
    
    /* Text area focus effect */
    .dark-textarea:focus {
      outline: none;
    }
    
    /* Custom scrollbar */
    .chat-input-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    
    .chat-input-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-input-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
    
    .chat-input-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    
    .dark .chat-input-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .dark .chat-input-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    /* Firefox scrollbar */
    .chat-input-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    }
    
    .dark .chat-input-scrollbar {
      scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
  `;

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>
      
      {/* Fog/cloud gradient background */}
<div className={`z-5 fixed bottom-0 left-0 right-0 ${
  isDarkMode 
    ? 'bg-gradient-to-t from-black via-black/95 to-transparent' 
    : 'bg-gradient-to-t from-white via-white/95 to-transparent'
}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-4">
          {/* Main container */}
          <div className={`relative rounded-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'dark-input-container' 
              : 'light-input-container'
          }`}>
            <div className="relative flex items-end p-5">
              {/* Text area */}
              <div className="flex-grow relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder=" "
                  rows="1"
                  className={`w-full resize-none outline-none pr-14 text-base leading-relaxed chat-input-scrollbar ${
                    isDarkMode 
                      ? 'dark-textarea bg-transparent text-gray-300 placeholder-gray-500' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  }`}
                  style={{
                    minHeight: '28px',
                    maxHeight: '120px',
                    paddingTop: '8px'
                  }}
                />
                
                {/* Floating label */}
                <label className={`absolute left-0 -top-2.5 text-xs font-medium transition-all duration-200 ${
                  message 
                    ? isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    : 'text-transparent'
                }`}>
                  Message Hiriya
                </label>
                
                {/* Visible placeholder */}
                <div 
                className={`absolute left-0 top-0 text-base pointer-events-none pt-2 ${
  message ? 'opacity-0' : 'opacity-70'
} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>  {/* Changed light mode to text-gray-400 */}
                  Ask about Ambo University...
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`absolute right-5 bottom-5 flex items-center justify-center rounded-full p-3 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  message.trim()
                    ? isDarkMode
                      ? 'dark-send-active'
                      : 'light-send-active'
                    : isDarkMode
                      ? 'dark-send-inactive'
                      : 'light-send-inactive'
                } ${message.trim() ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg 
                  className="w-5 h-5" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  stroke={message.trim() ? (isDarkMode ? "#000000" : "#ffffff") : (isDarkMode ? "#6b7280" : "#94a3b8")}
                  strokeWidth="2"
                >
                  <path 
                    d="M22 2L11 13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={message.trim() ? "currentColor" : "none"}
                  />
                </svg>
              </button>
            </div>

            {/* Status bar */}
            <div className={`px-5 py-3 rounded-b-2xl ${isDarkMode ? 'dark-status-bar' : 'light-status-bar'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Character counter */}
                  <div className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className={message.length > 900 ? (isDarkMode ? 'text-yellow-400' : 'text-amber-600') : ''}>
                      {message.length}
                    </span>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      /1000
                    </span>
                  </div>
                  
                  {/* Dot separator */}
                  <div className={`w-1 h-1 rounded-full ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-400'
                  }`}></div>
                  
                  {/* Status */}
                  <div className={`text-xs font-medium ${
                    message.trim() 
                      ? isDarkMode ? 'text-gray-300' : 'text-gray-400'  // Changed dark mode to gray
                      : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {message.trim() ? 'Ready to send' : 'Start typing...'}
                  </div>
                </div>
                
                {/* Keyboard hint */}
                <div className={`hidden sm:flex items-center space-x-2 text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span>Press</span>
                  <kbd className={`px-2 py-1 rounded font-sans ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    Enter
                  </kbd>
                  <span>to send</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 text-center">
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Press <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Shift + Enter</span> for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInput;