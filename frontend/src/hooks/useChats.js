import { useCallback, useEffect, useState } from 'react';
import { useAuthState, useGetToken } from './useAuthToken.js';
import { api, ApiError } from '../services/apiClient.js';

/**
 * Manages the list of past chats shown in the sidebar.
 * Only meaningful for signed-in users; returns empty + disabled flag for guests.
 */
export function useChats() {
  const { isSignedIn, isLoaded } = useAuthState();
  const getToken = useGetToken();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setChats([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { chats: data } = await api.listChats(getToken);
      setChats(data ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'unauthorized') {
        setChats([]);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    refresh();
  }, [isLoaded, refresh]);

  const remove = useCallback(
    async (chatId) => {
      try {
        await api.deleteChat(chatId, getToken);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [getToken],
  );

  return { chats, loading, error, refresh, remove, enabled: isSignedIn };
}
