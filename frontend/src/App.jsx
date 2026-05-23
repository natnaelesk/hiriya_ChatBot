import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import ChatMessages from './components/ChatMessages.jsx';
import ChatInput from './components/ChatInput.jsx';
import Sidebar from './components/Sidebar.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import AuthModal from './components/AuthModal.jsx';
import { useChat } from './hooks/useChat.js';
import { useChats } from './hooks/useChats.js';
import { useAuthState } from './hooks/useAuthToken.js';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const { isSignedIn } = useAuthState();
  const { chats, loading: chatsLoading, refresh: refreshChats, remove: removeChat, enabled: chatsEnabled } = useChats();
  const { messages, isStreaming, streamingMessageId, error, send, cancel, clear, dismissError } = useChat({
    chatId: activeChatId,
    setChatId: setActiveChatId,
  });

  // After the user finishes a turn, refresh the chats list so titles + ordering update.
  useEffect(() => {
    if (!isStreaming && isSignedIn) {
      refreshChats();
    }
  }, [isStreaming, isSignedIn, refreshChats]);

  const handleSend = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : draft).trim();
    if (!text) return;
    setDraft('');
    await send(text);
  };

  const handleNewChat = () => {
    if (isStreaming) cancel();
    clear();
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    if (isStreaming) cancel();
    setActiveChatId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id) => {
    await removeChat(id);
    if (activeChatId === id) {
      setActiveChatId(null);
      clear();
    }
  };

  const isWelcomeView = messages.length <= 1 && !isStreaming;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex h-full w-full">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          loading={chatsLoading}
          enabled={chatsEnabled}
          isSignedIn={isSignedIn}
          onOpenAuth={() => setAuthMode('sign-in')}
        />

        <div className="flex-1 flex flex-col min-w-0 relative">
          <Navbar
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onNewChat={handleNewChat}
            isStreaming={isStreaming}
            onOpenAuth={setAuthMode}
          />

          <main
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            aria-label="Chat conversation"
          >
            {isWelcomeView ? (
              <WelcomeScreen onPick={(prompt) => handleSend(prompt)} />
            ) : (
              <ChatMessages
                messages={messages}
                isStreaming={isStreaming}
                streamingMessageId={streamingMessageId}
                scrollContainerRef={scrollRef}
              />
            )}
            {error && (
              <ErrorBanner error={error} onDismiss={dismissError} />
            )}
          </main>

          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            onCancel={cancel}
            isStreaming={isStreaming}
          />
        </div>
      </div>
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} />
    </div>
  );
}
