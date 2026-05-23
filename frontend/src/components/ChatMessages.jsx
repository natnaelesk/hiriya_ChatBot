import { useEffect, useRef, useState } from 'react';
import Markdown from './Markdown.jsx';
import Sources from './Sources.jsx';
import ttsService from '../services/ttsService.js';
import { useGetToken } from '../hooks/useAuthToken.js';
import { cn } from '../lib/cn.js';

export default function ChatMessages({ messages, isStreaming, streamingMessageId, scrollContainerRef }) {
  const lastUserIdRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const getToken = useGetToken();

  useEffect(() => () => ttsService.stop(), []);

  useEffect(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    if (lastUser.id === lastUserIdRef.current) return;
    lastUserIdRef.current = lastUser.id;
    requestAnimationFrame(() => {
      const el = document.getElementById(`msg-${lastUser.id}`);
      const container = scrollContainerRef?.current;
      if (!el || !container) return;
      container.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    });
  }, [messages, scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container || !isStreaming) return;
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    if (distanceFromBottom < 120) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isStreaming, scrollContainerRef]);

  const handlePlay = async (msg) => {
    if (playingId === msg.id && ttsService.isPlaying) {
      ttsService.stop();
      setPlayingId(null);
      return;
    }
    ttsService.stop();
    setPlayingId(msg.id);
    setTtsLoading(true);
    try {
      await ttsService.speak(msg.content, getToken);
    } finally {
      setTtsLoading(false);
    }
    const interval = setInterval(() => {
      if (!ttsService.isPlaying) {
        setPlayingId(null);
        clearInterval(interval);
      }
    }, 150);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 pb-36 pt-8 sm:px-5">
      {messages.map((m) => {
        const isUser = m.role === 'user';
        if (!isUser && m.streaming && !m.content) return null;
        return (
          <div id={`msg-${m.id}`} key={m.id} className={cn('mb-6 flex', isUser ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[90%] sm:max-w-[78%]', isUser ? 'order-2' : 'order-1')}>
              <div
                className={cn(
                  'relative px-4 py-3 text-[15px] leading-relaxed',
                  isUser
                    ? 'rounded-2xl rounded-br-md bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white shadow-[var(--shadow-accent)]'
                    : 'rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-md',
                )}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <>
                    <Markdown>{m.content}</Markdown>
                    {m.streaming && (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--accent)] align-middle"
                        aria-hidden="true"
                      />
                    )}
                    {!m.streaming && m.content && (
                      <button
                        type="button"
                        onClick={() => handlePlay(m)}
                        className="absolute -top-3 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-sm transition-colors hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)] hover:bg-[var(--muted)]"
                        aria-label={playingId === m.id ? 'Stop' : 'Play'}
                      >
                        {ttsLoading && playingId === m.id ? (
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" strokeWidth="3" stroke="currentColor" className="opacity-75" />
                          </svg>
                        ) : playingId === m.id ? (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <rect x="5" y="5" width="10" height="10" rx="1" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
              {!isUser && Array.isArray(m.sources) && m.sources.length > 0 && (
                <Sources sources={m.sources} />
              )}
              {m.createdAt && (
                <div
                  className={cn(
                    'mt-2 font-mono-ui text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]',
                    isUser && 'text-right',
                  )}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isStreaming && !messages.some((m) => m.id === streamingMessageId && m.content) && (
        <div className="mb-6 flex justify-start">
          <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="mm-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">Hiriya is thinking…</span>
          </div>
        </div>
      )}
    </div>
  );
}
