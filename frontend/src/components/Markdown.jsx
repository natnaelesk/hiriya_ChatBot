import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Strip our internal [src:UUID] citation tokens before rendering — they're not
// meant for human eyes; the Sources panel already shows attributions.
const CITATION_RE = /\s*\[src:[^\]]+\]/g;

// Convert <map>URL</map> tags to a markdown link.
const MAP_RE = /<map>([^<]+)<\/map>/g;

function preprocess(text) {
  if (!text) return '';
  return String(text)
    .replace(CITATION_RE, '')
    .replace(MAP_RE, (_m, url) => `[Open in Google Maps](${url.trim()})`);
}

export default function Markdown({ children }) {
  const cleaned = preprocess(children);
  const headingClass = 'text-[var(--pg-foreground)] border-[var(--pg-soft-border)]';
  return (
    <div className="prose-chat prose-chat-light">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 underline hover:text-blue-700"
            />
          ),
          code: ({ inline, children, ...rest }) =>
            inline ? (
              <code
                {...rest}
                className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-800"
              >
                {children}
              </code>
            ) : (
              <pre
                className="overflow-x-auto rounded-lg bg-gray-100 p-3 font-mono text-sm text-gray-800"
              >
                <code {...rest}>{children}</code>
              </pre>
            ),
          table: (props) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-current/10">
              <table {...props} className="min-w-full text-sm" />
            </div>
          ),
          thead: (props) => (
            <thead {...props} className="bg-gray-50" />
          ),
          th: (props) => (
            <th {...props} className="px-3 py-2 text-left font-semibold border-b border-current/10" />
          ),
          td: (props) => (
            <td {...props} className="px-3 py-2 align-top border-b border-current/10 last:border-b-0" />
          ),
          ul: (props) => <ul {...props} className="my-2 list-disc pl-5 space-y-1.5" />,
          ol: (props) => <ol {...props} className="my-2 list-decimal pl-5 space-y-1.5" />,
          li: (props) => <li {...props} className="leading-relaxed pl-1" />,
          p: (props) => <p {...props} className="leading-relaxed" />,
          strong: (props) => <strong {...props} className="font-semibold" />,
          em: (props) => <em {...props} className="italic" />,
          h1: (props) => <h2 {...props} className={`text-lg font-bold mt-1 mb-2 ${headingClass}`} />,
          h2: (props) => (
            <h3
              {...props}
              className={`text-[15px] font-bold mt-4 mb-2 pb-1 border-b ${headingClass} first:mt-0`}
            />
          ),
          h3: (props) => <h4 {...props} className={`text-sm font-semibold mt-3 mb-1 ${headingClass}`} />,
          hr: (props) => <hr {...props} className="my-3 border-current/10" />,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
