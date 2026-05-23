import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetToken, useAuthState } from './useAuthToken.js';
import { streamChat, ApiError, api } from '../services/apiClient.js';

const GUEST_STORAGE_KEY = 'hiriya:guestChat';
const HISTORY_LIMIT = 100;

function newId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadGuestState() {
  if (typeof window === 'undefined') return { chatId: null, messages: [] };
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return { chatId: null, messages: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages)) return parsed;
  } catch {
    // bad JSON; reset
  }
  return { chatId: null, messages: [] };
}

function saveGuestState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}

function welcomeMessage() {
  return {
    id: newId(),
    role: 'assistant',
    content:
      "Selam! I'm **Hiriya**, your Ambo University assistant. I can help with campuses, programs, admissions, services, and student life — what would you like to know?",
    sources: [],
    createdAt: new Date().toISOString(),
  };
}

function classifyError(err) {
  if (err instanceof ApiError) return { code: err.code, status: err.status, message: err.message };
  if (err?.name === 'AbortError') return { code: 'aborted', status: 0, message: 'Cancelled.' };
  return { code: 'unknown', status: 0, message: err?.message ?? 'Something went wrong.' };
}

/**
 * Top-level chat hook. Owns:
 *   - the current chat's messages,
 *   - the active streaming response,
 *   - sending / cancelling / resetting,
 *   - guest-mode persistence to localStorage.
 *
 * Signed-in users load from / persist to the backend; this hook just feeds it
 * the chat id and messages — the actual API I/O for chat lists lives in useChats.
 */
export function useChat({ chatId, setChatId } = {}) {
  const { isSignedIn, isLoaded: authLoaded } = useAuthState();
  const getToken = useGetToken();

  const [messages, setMessages] = useState(() =>
    isSignedIn ? [welcomeMessage()] : (loadGuestState().messages.length
      ? loadGuestState().messages
      : [welcomeMessage()]),
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const guestChatIdRef = useRef(loadGuestState().chatId);

  // Persist guest history.
  useEffect(() => {
    if (isSignedIn) return;
    saveGuestState({
      chatId: guestChatIdRef.current,
      messages: messages.slice(-HISTORY_LIMIT),
    });
  }, [messages, isSignedIn]);

  // Load history when signed-in user picks a chat.
  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) return;
    let cancelled = false;
    async function run() {
      if (!chatId) {
        setMessages([welcomeMessage()]);
        return;
      }
      try {
        const { messages: serverMsgs } = await api.getMessages(chatId, getToken);
        if (cancelled) return;
        setMessages(
          serverMsgs.length === 0
            ? [welcomeMessage()]
            : serverMsgs.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                sources: m.sources ?? [],
                createdAt: m.created_at,
              })),
        );
      } catch (err) {
        if (cancelled) return;
        setError(classifyError(err));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, chatId, getToken]);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const send = useCallback(
    async (text) => {
      const trimmed = String(text ?? '').trim();
      if (!trimmed || isStreaming) return;
      setError(null);

      const userMsg = {
        id: newId(),
        role: 'user',
        content: trimmed,
        sources: [],
        createdAt: new Date().toISOString(),
      };
      const assistantId = newId();
      const assistantMsg = {
        id: assistantId,
        role: 'assistant',
        content: '',
        sources: [],
        createdAt: new Date().toISOString(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreamingMessageId(assistantId);
      setIsStreaming(true);

      const ac = new AbortController();
      abortRef.current = ac;

      // For guest users we send the recent local history so the LLM has context.
      const guestHistory = !isSignedIn
        ? messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content }))
        : [];

      try {
        let aggregated = '';
        let currentSources = [];

        for await (const evt of streamChat({
          message: trimmed,
          chatId: isSignedIn ? chatId ?? null : null,
          history: guestHistory,
          getToken: isSignedIn ? getToken : undefined,
          signal: ac.signal,
        })) {
          if (evt.event === 'sources' && Array.isArray(evt.data?.sources)) {
            currentSources = evt.data.sources;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, sources: currentSources } : m)),
            );
          } else if (evt.event === 'chat' && typeof evt.data?.chatId === 'string') {
            if (isSignedIn && setChatId && evt.data.chatId !== chatId) {
              setChatId(evt.data.chatId);
            } else if (!isSignedIn) {
              guestChatIdRef.current = evt.data.chatId;
            }
          } else if (evt.event === 'delta' && typeof evt.data?.text === 'string') {
            aggregated += evt.data.text;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: aggregated } : m)),
            );
          } else if (evt.event === 'error') {
            const e = evt.data ?? {};
            setError({
              code: e.code ?? 'server_error',
              status: 0,
              message: e.message ?? 'The server reported an error.',
            });
            break;
          } else if (evt.event === 'done') {
            break;
          }
        }

        if (!aggregated) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false, content: aggregated } : m,
            ),
          );
        }
      } catch (err) {
        const info = classifyError(err);
        if (info.code !== 'aborted') setError(info);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  streaming: false,
                  content: m.content || '',
                  error: info.code,
                }
              : m,
          ),
        );
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    },
    [isStreaming, isSignedIn, messages, chatId, getToken, setChatId],
  );

  const clear = useCallback(() => {
    cancel();
    setMessages([welcomeMessage()]);
    setError(null);
    if (!isSignedIn) {
      guestChatIdRef.current = null;
      saveGuestState({ chatId: null, messages: [] });
    } else if (setChatId) {
      setChatId(null);
    }
  }, [cancel, isSignedIn, setChatId]);

  const dismissError = useCallback(() => setError(null), []);

  return { messages, isStreaming, streamingMessageId, error, send, cancel, clear, dismissError };
}
