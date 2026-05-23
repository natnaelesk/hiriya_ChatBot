// Semantic-ish chunker.
//
// Strategy:
//   1. Split on markdown-style headings (#, ##, ...) so each section starts a chunk.
//   2. Within a section, split on blank-line paragraphs.
//   3. Greedily pack paragraphs into ~targetTokens-sized chunks; emit early when full.
//   4. Carry forward an overlap of `overlapTokens` from the tail of the previous chunk
//      to keep cross-boundary context.
//
// Token counting: we don't ship a real BPE tokenizer to keep the bundle tiny.
// The `≈ chars/4` rule of thumb is plenty accurate for sizing chunks.

const DEFAULT_TARGET_TOKENS = 500;
const DEFAULT_OVERLAP_TOKENS = 50;
const DEFAULT_HARD_MAX_TOKENS = 800; // never exceed (avoid embedding API errors)

const tokens = (s) => Math.ceil(s.length / 4);

function splitSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = { heading: null, lines: [] };
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      if (current.lines.length > 0 || current.heading) sections.push(current);
      current = { heading: m[2], lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0 || current.heading) sections.push(current);
  return sections.length > 0 ? sections : [{ heading: null, lines }];
}

function splitParagraphs(lines) {
  const paras = [];
  let buf = [];
  for (const line of lines) {
    if (line.trim() === '') {
      if (buf.length) {
        paras.push(buf.join('\n').trim());
        buf = [];
      }
    } else {
      buf.push(line);
    }
  }
  if (buf.length) paras.push(buf.join('\n').trim());
  return paras.filter((p) => p.length > 0);
}

function splitByApproxTokens(text, maxTokens) {
  // Last-resort splitter for paragraphs that are already too big.
  // Splits on sentence-ish boundaries first, then hard-cuts if needed.
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .flatMap((s) => (tokens(s) > maxTokens ? hardCut(s, maxTokens) : [s]));

  const out = [];
  let cur = '';
  for (const s of sentences) {
    if (tokens(cur) + tokens(s) > maxTokens && cur) {
      out.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? `${cur} ${s}` : s;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function hardCut(text, maxTokens) {
  const maxChars = maxTokens * 4;
  const out = [];
  for (let i = 0; i < text.length; i += maxChars) out.push(text.slice(i, i + maxChars));
  return out;
}

function takeOverlapTail(text, overlapTokens) {
  if (!text || overlapTokens <= 0) return '';
  const chars = overlapTokens * 4;
  if (text.length <= chars) return text;
  // Snap to sentence boundary if possible.
  const tail = text.slice(-chars);
  const m = tail.match(/[.!?]\s+/);
  return m ? tail.slice(m.index + m[0].length) : tail;
}

export function chunkText(text, opts = {}) {
  const target = opts.targetTokens ?? DEFAULT_TARGET_TOKENS;
  const overlap = opts.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;
  const hardMax = opts.hardMaxTokens ?? DEFAULT_HARD_MAX_TOKENS;

  const cleaned = String(text).replaceAll('\u0000', '').trim();
  if (!cleaned) return [];

  const chunks = [];
  const sections = splitSections(cleaned);

  for (const section of sections) {
    const headingPrefix = section.heading ? `# ${section.heading}\n\n` : '';
    const paras = splitParagraphs(section.lines);
    if (paras.length === 0 && section.heading) {
      chunks.push({ content: `# ${section.heading}`, heading: section.heading });
      continue;
    }

    let buf = '';
    let bufTokens = 0;
    let firstInSection = true;

    const flush = () => {
      if (!buf.trim()) return;
      const content = (firstInSection ? headingPrefix : '') + buf.trim();
      chunks.push({ content, heading: section.heading });
      const tail = takeOverlapTail(buf, overlap);
      buf = tail ? `${tail}\n\n` : '';
      bufTokens = tokens(buf);
      firstInSection = false;
    };

    for (let para of paras) {
      let pieces = [para];
      if (tokens(para) > hardMax) pieces = splitByApproxTokens(para, target);

      for (const piece of pieces) {
        const t = tokens(piece);
        if (bufTokens + t > target && buf.trim()) flush();
        buf += (buf ? '\n\n' : '') + piece;
        bufTokens += t;
        if (bufTokens >= hardMax) flush();
      }
    }
    flush();
  }

  return chunks
    .map((c) => ({ ...c, content: c.content.trim() }))
    .filter((c) => c.content.length > 0);
}
