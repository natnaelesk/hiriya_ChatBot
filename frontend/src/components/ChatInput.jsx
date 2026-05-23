import { useEffect, useRef } from 'react';
import Button from './ui/Button.jsx';

export default function ChatInput({
  value,
  onChange,
  onSend,
  onCancel,
  isStreaming,
  placeholder = 'Message Hiriya…',
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      onSend?.();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent px-3 pb-5 pt-12 sm:px-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg transition-shadow duration-200 focus-within:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] focus-within:shadow-[var(--shadow-accent)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            aria-label="Message Hiriya"
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-[var(--foreground)] placeholder:text-[color-mix(in_srgb,var(--muted-foreground)_60%,transparent)] focus:outline-none"
            style={{ maxHeight: 240 }}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onCancel}
              className="mb-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-600 text-white transition-transform active:scale-[0.98]"
              aria-label="Stop generating"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <rect x="5" y="5" width="10" height="10" rx="2" />
              </svg>
            </button>
          ) : (
            <Button
              variant="primary"
              size="icon"
              onClick={onSend}
              disabled={!value?.trim()}
              className="mb-0.5 shrink-0"
              aria-label="Send"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 10l14-7-7 14-2-6-5-1z" />
              </svg>
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--muted-foreground)]">
          Shift + Enter for a new line · Verify important information with official sources
        </p>
      </div>
    </div>
  );
}
