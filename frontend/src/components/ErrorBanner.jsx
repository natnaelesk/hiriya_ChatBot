// Maps backend error codes to friendly user messages so the UI never shows
// "I'm having trouble accessing the database" for completely unrelated reasons.

const FRIENDLY = {
  network: {
    title: "Can't reach the server",
    body: "Your network or the Hiriya backend appears to be unavailable. Check your connection and try again.",
  },
  unauthorized: {
    title: 'Sign-in required',
    body: 'Your session has expired. Sign in again to continue.',
  },
  rate_limited: {
    title: 'Slow down',
    body: 'Too many requests in a short time. Please wait a moment and try again.',
  },
  server_error: {
    title: 'Server hiccup',
    body: 'The server ran into a problem. Please try again. If it keeps happening, the on-call team will see it in the logs.',
  },
  retrieval_failed: {
    title: 'Knowledge base unavailable',
    body: 'I could not search the university knowledge base right now. Try again in a moment.',
  },
  llm_failed: {
    title: 'Language model unavailable',
    body: 'The model I use to compose answers is unreachable right now. Please try again shortly.',
  },
  llm_stream_failed: {
    title: 'Streaming interrupted',
    body: 'My answer was cut short. Try asking again.',
  },
  request_failed: {
    title: 'Request failed',
    body: 'Something went wrong with that request. Try again or rephrase your question.',
  },
  unknown: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred.',
  },
};

export default function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  const info = FRIENDLY[error.code] ?? FRIENDLY.unknown;

  return (
    <div
      className="mx-auto my-3 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1 text-sm">
          <div className="font-semibold">{info.title}</div>
          <div className="mt-0.5">{info.body}</div>
          {error.message && error.message !== info.body && (
            <div className="mt-1 font-mono text-[11px] text-red-700/70">
              {error.message}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-1 text-red-800/70 hover:bg-black/5"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
