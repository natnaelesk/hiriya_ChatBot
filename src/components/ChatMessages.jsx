/* eslint-disable no-useless-escape */
import React, { useState, useEffect } from 'react';
import ttsService from '../services/ttsService';

const ChatMessages = ({ messages, chatContainerRef, isDarkMode, isTyping }) => {
  const [typingDots, setTypingDots] = useState(0);
  const [lastUserMessageId, setLastUserMessageId] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple audio handler - play or stop
  const handleAudioClick = async (text, id) => {
    // If clicking the same message that's playing, STOP it
    if (playingMessageId === id && ttsService.isPlaying) {
      ttsService.stop();
      setPlayingMessageId(null);
      return;
    }
    
    // Stop any currently playing audio
    ttsService.stop();
    
    // Start playing this message
    setPlayingMessageId(id);
    setIsLoading(true);
    
    await ttsService.speak(text);
    
    setIsLoading(false);
    
    // Check when audio finishes
    const checkInterval = setInterval(() => {
      if (!ttsService.isPlaying) {
        setPlayingMessageId(null);
        clearInterval(checkInterval);
      }
    }, 100);
  };

  // Stop all audio when component unmounts
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const customStyles = `
    .dark-user-bubble {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border: 1px solid #333333;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .light-user-bubble {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: 1px solid #1e40af;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
    }
    
    .dark-ai-bubble {
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      color: #f0f0f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .light-ai-bubble {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      color: #1e293b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .dark-welcome-box {
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      color: #d1d5db;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .light-welcome-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      color: #4b5563;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .dark-typing-bubble {
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      color: #f0f0f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .light-typing-bubble {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      color: #1e293b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .chat-link {
      color: #2563eb;
      transition: color 0.2s ease;
    }
    
    .chat-link:hover {
      color: #1d4ed8;
    }
    
    .dark .chat-link {
      color: #60a5fa;
    }
    
    .dark .chat-link:hover {
      color: #3b82f6;
    }
    
    .chat-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    
    .chat-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }
    
    .chat-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    
    .dark .chat-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .dark .chat-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .chat-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
    }
    
    .dark .chat-scrollbar {
      scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
  `;

  const renderMessageWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-link inline-flex items-center gap-1 underline underline-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            {part.replace('https://', '').replace('http://', '').split('/')[0]}
          </a>
        );
      }
      return renderFormattedText(part);
    });
  };

  const renderFormattedText = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold">{part}</strong>;
      }
      
      const italicRegex = /\*(.*?)\*/g;
      const italicParts = part.split(italicRegex);
      
      return italicParts.map((italicPart, italicIndex) => {
        if (italicIndex % 2 === 1) {
          return <em key={`${index}-${italicIndex}`} className="italic">{italicPart}</em>;
        }
        return italicPart;
      });
    });
  };

  const renderNumberedList = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={lineIndex} className="flex items-start gap-3 ml-1 mb-1">
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 border border-gray-600' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}>
              {numberedMatch[1]}
            </span>
            <span>{renderMessageWithLinks(numberedMatch[2])}</span>
          </div>
        );
      }
      
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={lineIndex} className="flex items-start gap-3 ml-1 mb-1">
            <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
              isDarkMode 
                ? 'bg-gray-500' 
                : 'bg-gray-400'
            }`}></span>
            <span>{renderMessageWithLinks(line.replace(/^[-\•]\s+/, ''))}</span>
          </div>
        );
      }
      
      return (
        <div key={lineIndex} className="mb-1">
          {renderMessageWithLinks(line)}
        </div>
      );
    });
  };

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingDots((prev) => (prev + 1) % 4);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setTypingDots(0);
    }
  }, [isTyping]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.isUser) return;

    let i = 0;
    setStreamingText('');

    const interval = setInterval(() => {
      i++;
      setStreamingText(lastMessage.text.slice(0, i));
      if (i >= lastMessage.text.length) clearInterval(interval);
    }, 5);

    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    const userMessages = messages.filter(msg => msg.isUser);
    if (userMessages.length > 0) {
      setLastUserMessageId(userMessages[userMessages.length - 1].id);
    }
  }, [messages]);

  useEffect(() => {
    if (!chatContainerRef.current || !lastUserMessageId) return;

    const lastUserMessageElement = document.getElementById(`message-${lastUserMessageId}`);
    if (lastUserMessageElement) {
      const navbarHeight = 80;
      const messageOffset = lastUserMessageElement.offsetTop - navbarHeight - 20;
      
      chatContainerRef.current.scrollTo({
        top: messageOffset,
        behavior: 'smooth'
      });
    }
  }, [lastUserMessageId, chatContainerRef]);

  return (
    <>
      <style>{customStyles}</style>
      
      <div 
        ref={chatContainerRef}
        className="chat-scrollbar absolute top-0 bottom-0 left-0 right-0 overflow-y-auto px-4 overflow-x-hidden"
      >
        <div className="max-w-3xl mx-auto pt-28 pb-32 px-2 sm:px-4">
          {messages.length <= 1 && !isTyping && (
            <div className="text-center mb-12 pt-8">
              <div className={`inline-block rounded-2xl px-6 py-3 ${isDarkMode ? 'dark-welcome-box' : 'light-welcome-box'}`}>
                <p className="text-sm font-medium">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>💬</span> Ask Hiriya about campus locations, departments, or anything else!
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              id={`message-${msg.id}`}
              key={msg.id}
              className={`mb-8 ${msg.isUser ? 'text-right' : 'text-left'}`}
            >
              <div className={`inline-block max-w-[85%] ${msg.isUser ? 'ml-auto' : ''}`}>
                <div className={`relative rounded-2xl px-5 py-4 ${msg.isUser 
                  ? isDarkMode ? 'dark-user-bubble' : 'light-user-bubble'
                  : isDarkMode ? 'dark-ai-bubble' : 'light-ai-bubble'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed text-[15px] tracking-[0.01em]">
                    {!msg.isUser && index === messages.length - 1
                      ? renderNumberedList(streamingText)
                      : renderNumberedList(msg.text)}
                  </div>

                  {/* AUDIO BUTTON - SIMPLE PLAY/STOP */}
                  {!msg.isUser && (
                    <button
                      onClick={() => handleAudioClick(msg.text, msg.id)}
                      disabled={isLoading && playingMessageId === msg.id}
                      className={`absolute -top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20' 
                          : 'bg-black/10 backdrop-blur-sm hover:bg-black/20 border border-black/20'
                      } ${isLoading && playingMessageId === msg.id ? 'animate-pulse' : ''}`}
                      title={playingMessageId === msg.id ? "Stop" : "Play"}
                    >
                      {isLoading && playingMessageId === msg.id ? (
                        // Loading spinner
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : playingMessageId === msg.id ? (
                        // STOP icon (square)
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <rect x="5" y="5" width="10" height="10" rx="1" />
                        </svg>
                      ) : (
                        // PLAY icon
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {msg.isUser && index === messages.length - 1 && (
                    <div className="absolute -bottom-2 right-3">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" fill="#22c55e" stroke={isDarkMode ? "#1a1a1a" : "#ffffff"} strokeWidth="1"/>
                        <path d="M4 6L5.5 7.5L8 4.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className={`mt-2 text-xs ${msg.isUser ? 'text-right' : 'text-left'} ${
                  isDarkMode 
                    ? 'text-gray-500' 
                    : msg.isUser 
                      ? 'text-blue-600' 
                      : 'text-gray-600'
                }`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-left mb-8">
              <div className="inline-block max-w-[85%]">
                <div className={`relative rounded-2xl px-5 py-4 ${isDarkMode ? 'dark-typing-bubble' : 'light-typing-bubble'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-400' 
                          : 'bg-gray-500'
                      } ${typingDots >= 1 ? 'opacity-100' : 'opacity-40'} transition-opacity duration-200`}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-400' 
                          : 'bg-gray-500'
                      } ${typingDots >= 2 ? 'opacity-100' : 'opacity-40'} transition-opacity duration-200 delay-75`}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode 
                          ? 'bg-gray-400' 
                          : 'bg-gray-500'
                      } ${typingDots >= 3 ? 'opacity-100' : 'opacity-40'} transition-opacity duration-200 delay-150`}></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      isDarkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-700'
                    }`}>
                      Hiriya is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="min-h-[40px]"></div>
        </div>
      </div>
    </>
  );
};

export default ChatMessages;