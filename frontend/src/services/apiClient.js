// Single source of truth for backend HTTP/SSE calls.
//
// Every helper accepts an optional `getToken` async function. Pass
// `useAuth().getToken` from `@clerk/clerk-react` and we'll attach the JWT
// when the user is signed in. Without a token the request is treated as
// guest by the backend.

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'unknown', detail = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function authHeaders(getToken) {
  if (typeof getToken !== 'function') return {};
  try {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(method, path, { body, getToken, signal } = {}) {
  const headers = { Accept: 'application/json', ...(await authHeaders(getToken)) };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let resp;
  try {
    resp = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error: could not reach the server.', {
      code: 'network',
      detail: err.message,
    });
  }

  const text = await resp.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON; leave parsed null
    }
  }

  if (!resp.ok) {
    const message = parsed?.error ?? `Request failed (${resp.status})`;
    const code =
      resp.status === 401 ? 'unauthorized' :
      resp.status === 429 ? 'rate_limited' :
      resp.status >= 500 ? 'server_error' : 'request_failed';
    throw new ApiError(message, { status: resp.status, code, detail: parsed?.detail ?? null });
  }
  return parsed;
}

export const api = {
  health: (getToken) => request('GET', '/api/health', { getToken }),
  listChats: (getToken) => request('GET', '/api/chats', { getToken }),
  createChat: (title, getToken) => request('POST', '/api/chats', { body: { title }, getToken }),
  getMessages: (chatId, getToken) =>
    request('GET', `/api/chats/${encodeURIComponent(chatId)}/messages`, { getToken }),
  deleteChat: (chatId, getToken) =>
    request('DELETE', `/api/chats/${encodeURIComponent(chatId)}`, { getToken }),
};

/**
 * Stream a chat reply via SSE. Returns an async iterator yielding
 * { event, data } objects. The caller is responsible for ending the loop
 * (e.g. on `done` or `error`). Pass an `AbortSignal` to cancel mid-stream.
 */
export async function* streamChat({ message, chatId = null, history = [], getToken, signal } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders(getToken)) };
  let resp;
  try {
    resp = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, chatId, history }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error: could not reach the server.', {
      code: 'network',
      detail: err.message,
    });
  }

  if (!resp.ok || !resp.body) {
    let detail = null;
    try {
      detail = await resp.text();
    } catch {
      // ignore
    }
    throw new ApiError(`Chat request failed (${resp.status})`, {
      status: resp.status,
      code:
        resp.status === 401 ? 'unauthorized' :
        resp.status === 429 ? 'rate_limited' :
        resp.status >= 500 ? 'server_error' : 'request_failed',
      detail,
    });
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by a blank line.
    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (!raw.trim()) continue;

      let event = 'message';
      let dataLines = [];
      for (const line of raw.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataLines.push(line.slice(6));
      }
      const data = dataLines.length === 0 ? null : safeJsonParse(dataLines.join('\n'));
      yield { event, data };
    }
  }
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export async function ttsBlob(text, getToken) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders(getToken)) };
  const resp = await fetch(`${BASE_URL}/api/tts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) {
    let detail = null;
    try {
      const t = await resp.text();
      detail = t;
    } catch {
      // ignore
    }
    throw new ApiError(`TTS failed (${resp.status})`, {
      status: resp.status,
      code: resp.status >= 500 ? 'server_error' : 'request_failed',
      detail,
    });
  }
  return resp.blob();
}
