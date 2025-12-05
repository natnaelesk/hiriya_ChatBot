// components/Navbar.jsx - Updated with clean dark mode design
import React from 'react';

// Import your university logo image
import universityLogo from '../assets/ambo-logo.png'; // Update this path

const Navbar = ({ isDarkMode, toggleTheme, toggleMobileMenu, isMobileMenuOpen, onNewChat, messageCount = 0 }) => {
  // Custom CSS for clean dark mode gradients
  const customDarkStyles = `
    .dark-nav-bg {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border: 1px solid #333333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .dark-mobile-bg {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border: 1px solid #333333;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    
    .dark-btn-gradient {
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      color: #ffffff;
      transition: all 0.2s ease;
    }
    
    .dark-btn-gradient:hover {
      background: linear-gradient(135deg, #3d3d3d 0%, #2a2a2a 100%);
      border-color: #555555;
    }
    
    .dark-count-badge {
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border: 1px solid #404040;
      color: #d1d5db;
    }
    
    .dark-link-underline::after {
      background: linear-gradient(to right, #3b82f6, #fbbf24);
    }
  `;

  return (
    <>
      <style>{customDarkStyles}</style>
      
      {/* NAV WRAPPER */}
      <div className="w-full flex justify-center mt-4 px-3">
        {/* NAV BAR */}
        <nav
          id="navBar"
          className={`border rounded-full shadow-lg w-full max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-sm ${
            isDarkMode 
              ? `dark-nav-bg` 
              : `bg-slate-50/95 border-blue-200/50 shadow-blue-200/10`
          }`}
        >
          {/* LOGO AREA with Hiriya chatbot name */}
          <div className="flex items-center gap-3">
            {/* University Branding with Image Logo */}
            <div className="flex items-center gap-3">
              {/* University Logo Image */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <img 
                  src={universityLogo} 
                  alt="Ambo University Logo" 
                  className="w-full h-full object-contain"
                />
                
                {/* Fallback text if image fails to load */}
                <div className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-700'
                }`} style={{ display: 'none' }}>
                  AU
                </div>
              </div>
              
              {/* Chatbot Name with University Context */}
              <div className="flex flex-col">
                <div className={`text-xl font-bold tracking-tight ${
                  isDarkMode 
                    ? 'text-gray-100' 
                    : 'text-slate-900 bg-gradient-to-r from-blue-700 to-amber-600 bg-clip-text text-transparent'
                }`}>
                  Hiriya
                </div>
                <div className={`hidden sm:block text-xs -mt-0.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  Ambo University Assistant
                </div>
              </div>
            </div>
            
            {/* Message count badge */}
            <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isDarkMode 
                ? 'dark-count-badge' 
                : 'bg-gradient-to-r from-blue-100/50 to-amber-100/30 border border-blue-200/50 text-amber-800'
            }`}>
              <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-amber-700'}`}>{messageCount}</span>
              <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-amber-700/80'}`}>messages</span>
            </div>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className={`font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? `text-gray-200 hover:text-gray-100` 
                : `text-slate-800/90 hover:text-amber-700`
            }`}>
              <span className={`relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:transition-all after:duration-300 hover:after:w-full ${
                isDarkMode ? 'dark-link-underline' : 'after:bg-gradient-to-r after:from-blue-400 after:to-amber-400'
              }`}>
                Home
              </span>
            </a>
            <a href="#" className={`font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? `text-gray-200 hover:text-gray-100` 
                : `text-slate-800/90 hover:text-amber-700`
            }`}>
              <span className={`relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:transition-all after:duration-300 hover:after:w-full ${
                isDarkMode ? 'dark-link-underline' : 'after:bg-gradient-to-r after:from-blue-400 after:to-amber-400'
              }`}>
                Campuses
              </span>
            </a>
            <a href="#" className={`font-medium transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? `text-gray-200 hover:text-gray-100` 
                : `text-slate-800/90 hover:text-amber-700`
            }`}>
              <span className={`relative after:absolute after:left-0 after:-bottom-1 after:h-[1px] after:w-0 after:transition-all after:duration-300 hover:after:w-full ${
                isDarkMode ? 'dark-link-underline' : 'after:bg-gradient-to-r after:from-blue-400 after:to-amber-400'
              }`}>
                About
              </span>
            </a>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className={`px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                isDarkMode 
                  ? 'dark-btn-gradient' 
                  : 'bg-gradient-to-r from-blue-100/60 to-amber-100/40 hover:from-blue-100/80 hover:to-amber-100/60 border border-blue-200/60 text-amber-800 shadow-lg shadow-blue-200/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">New Chat</span>
              {messageCount > 10 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                    : 'bg-gradient-to-r from-amber-200/60 to-blue-100/40 border border-amber-300/60 text-amber-800'
                }`}>
                  ⚡
                </span>
              )}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full border transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'dark-btn-gradient' 
                  : 'bg-gradient-to-r from-blue-100/40 to-amber-100/30 border-blue-200/50 hover:from-blue-100/60 hover:to-amber-100/50 text-amber-700 shadow-lg shadow-blue-200/10'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
              ) : (
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
              )}
            </button>
          </div>

          {/* BURGER MENU (mobile) */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col gap-1.5 transition-all duration-300 group"
            aria-label="Menu"
          >
            <span className={`burger-line w-7 h-0.5 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-400 group-hover:bg-gray-300' 
                : 'bg-amber-700/90 group-hover:bg-amber-700'
            }`}></span>
            <span className={`burger-line w-7 h-0.5 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-400 group-hover:bg-gray-300' 
                : 'bg-amber-700/90 group-hover:bg-amber-700'
            }`}></span>
            <span className={`burger-line w-5 h-0.5 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-400 ml-2 group-hover:bg-gray-300 group-hover:w-7' 
                : 'bg-amber-700/90 ml-2 group-hover:bg-amber-700 group-hover:w-7'
            }`}></span>
          </button>
        </nav>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div 
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-3 w-full px-4`}
      >
        <div
          id="mobileMenuContent"
          className={`rounded-2xl p-4 w-full max-w-5xl mx-auto shadow-xl backdrop-blur-sm ${
            isDarkMode 
              ? `dark-mobile-bg` 
              : `bg-gradient-to-b from-slate-50/95 to-blue-50/90 border border-blue-200/50 shadow-blue-200/20`
          }`}
        >
          {/* Mobile Header with University Info */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700/30 dark:border-slate-300/30">
            {/* University Logo Image for Mobile */}
            <div className="w-14 h-14 flex items-center justify-center">
              <img 
                src={universityLogo} 
                alt="Ambo University Logo" 
                className="w-full h-full object-contain"
              />
              {/* Fallback text */}
              <div className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`} style={{ display: 'none' }}>
                AU
              </div>
            </div>
            <div>
              <div className={`font-bold ${
                isDarkMode ? 'text-gray-100' : 'text-slate-900'
              }`}>
                Hiriya Chatbot
              </div>
              <div className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-slate-500'
              }`}>
                Ambo University • Est. 1947
              </div>
            </div>
          </div>
          
          {/* Message count in mobile menu */}
          <div className={`flex items-center justify-between mb-4 px-4 py-3 rounded-xl ${
            isDarkMode 
              ? 'dark-count-badge' 
              : 'bg-gradient-to-r from-blue-100/40 to-amber-100/30 border border-blue-200/50'
          }`}>
            <span className={`font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-amber-800'
            }`}>Conversation</span>
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-gray-300' 
                : 'bg-gradient-to-r from-blue-100/60 to-amber-100/40 border border-blue-300/50 text-amber-800'
            }`}>
              {messageCount} messages
            </div>
          </div>
          
          {/* Mobile Navigation Links */}
          <a href="#" className={`block py-3 px-4 font-medium rounded-lg transition-all duration-300 ${
            isDarkMode 
              ? `text-gray-200 hover:text-gray-100 hover:bg-gray-800/30` 
              : `text-slate-800/90 hover:text-amber-700 hover:bg-blue-100/40`
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </div>
          </a>
          <a href="#" className={`block py-3 px-4 font-medium rounded-lg transition-all duration-300 ${
            isDarkMode 
              ? `text-gray-200 hover:text-gray-100 hover:bg-gray-800/30` 
              : `text-slate-800/90 hover:text-amber-700 hover:bg-blue-100/40`
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Campuses
            </div>
          </a>
          <a href="#" className={`block py-3 px-4 font-medium rounded-lg transition-all duration-300 ${
            isDarkMode 
              ? `text-gray-200 hover:text-gray-100 hover:bg-gray-800/30` 
              : `text-slate-800/90 hover:text-amber-700 hover:bg-blue-100/40`
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0 0h-1m1 0v4m2-8a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About University
            </div>
          </a>

          {/* Warning for long conversations */}
          {messageCount > 10 && (
            <div className={`my-4 px-4 py-3 rounded-xl border ${
              isDarkMode 
                ? 'bg-gray-800/30 border-gray-600 text-gray-300' 
                : 'bg-gradient-to-r from-amber-100/50 to-blue-100/30 border-amber-300/60 text-amber-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-gray-700' 
                    : 'bg-gradient-to-r from-amber-200/60 to-blue-100/40'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-amber-800'
                }`}>
                  Consider starting a new chat for optimal responses
                </span>
              </div>
            </div>
          )}

          {/* New Chat Button in Mobile Menu */}
          <button
            onClick={() => {
              onNewChat();
              toggleMobileMenu();
            }}
            className={`w-full mt-4 px-4 py-3.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
              isDarkMode 
                ? 'dark-btn-gradient' 
                : 'bg-gradient-to-r from-blue-100/60 to-amber-100/40 hover:from-blue-100/80 hover:to-amber-100/60 border-blue-300/60 text-amber-800 shadow-lg shadow-blue-200/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold">New Chat</span>
          </button>

          {/* Theme Toggle in Mobile Menu */}
          <button
            onClick={() => {
              toggleTheme();
              toggleMobileMenu();
            }}
            className={`w-full mt-3 px-4 py-3.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] ${
              isDarkMode 
                ? 'dark-btn-gradient' 
                : 'bg-gradient-to-r from-blue-100/50 to-amber-100/30 hover:from-blue-100/70 hover:to-amber-100/50 border-blue-300/60 text-amber-800 shadow-lg shadow-blue-200/10'
            }`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
                <span className="font-semibold">Light Mode</span>
              </>
            ) : (
              <>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                  />
                </svg>
                <span className="font-semibold">Dark Mode</span>
              </>
            )}
          </button>
          
          {/* University Footer Info */}
          <div className={`mt-4 pt-3 border-t text-center ${
            isDarkMode ? 'border-gray-700/30' : 'border-slate-300/30'
          }`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              © {new Date().getFullYear()} Ambo University • Hiriya Assistant
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;