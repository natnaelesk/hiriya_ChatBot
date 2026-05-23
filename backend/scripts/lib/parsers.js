import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { load as loadHtml } from 'cheerio';

async function parsePdf(filePath) {
  // pdf-parse is CJS and ships a debug harness that runs at import time, breaking on
  // missing test fixtures. Import the actual implementation file directly to avoid that.
  const mod = await import('pdf-parse/lib/pdf-parse.js');
  const pdfParse = mod.default ?? mod;
  const buf = await readFile(filePath);
  const out = await pdfParse(buf);
  return {
    title: out.info?.Title || path.basename(filePath, path.extname(filePath)),
    text: (out.text ?? '').trim(),
    metadata: { pages: out.numpages, info: out.info ?? null },
  };
}

async function parseMarkdown(filePath) {
  const text = await readFile(filePath, 'utf8');
  const titleMatch = text.match(/^\s*#\s+(.+)$/m);
  return {
    title: titleMatch?.[1]?.trim() || path.basename(filePath, path.extname(filePath)),
    text: text.trim(),
    metadata: { format: 'markdown' },
  };
}

async function parsePlain(filePath) {
  const text = await readFile(filePath, 'utf8');
  return {
    title: path.basename(filePath, path.extname(filePath)),
    text: text.trim(),
    metadata: { format: 'text' },
  };
}

async function parseHtml(filePath) {
  const html = await readFile(filePath, 'utf8');
  const $ = loadHtml(html);
  $('script, style, noscript, nav, footer, header').remove();
  const title = $('title').first().text().trim() || $('h1').first().text().trim();
  const text = $('body').text().replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return {
    title: title || path.basename(filePath, path.extname(filePath)),
    text,
    metadata: { format: 'html' },
  };
}

/** Appended when ingesting JSON-derived knowledge so credits stay in CONTEXT. */
export const HIRIYA_ATTRIBUTION_FOOTER = `---
**Hiriya:** Created by the **Ambo University Developer's Club**; **Natnael Eskinder** is the club leader.`;

function isKnowledgeTopicArray(obj) {
  return (
    Array.isArray(obj) &&
    obj.length > 0 &&
    obj.every(
      (e) =>
        e &&
        typeof e === 'object' &&
        typeof e.topic === 'string' &&
        typeof e.answer === 'string' &&
        Array.isArray(e.questions),
    )
  );
}

function formatKnowledgeTopicArray(arr) {
  return arr
    .map((e) => {
      const qs = e.questions.join(' | ');
      const syns =
        Array.isArray(e.synonyms) && e.synonyms.length ? e.synonyms.join(', ') : '';
      let block = `## ${e.topic}\n\n**Typical questions:** ${qs}\n\n**Answer:** ${e.answer}`;
      if (syns) block += `\n\n**Related keywords:** ${syns}`;
      return block;
    })
    .join('\n\n---\n\n');
}

function isCampusLocationsArray(obj) {
  return (
    Array.isArray(obj) &&
    obj.length > 0 &&
    obj.every((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
      const keys = Object.keys(item);
      if (keys.length !== 1) return false;
      const campus = item[keys[0]];
      return campus && typeof campus === 'object' && ('map' in campus || 'name' in campus);
    })
  );
}

function formatCampusLocationsArray(arr) {
  const parts = [];
  for (const item of arr) {
    const campusName = Object.keys(item)[0];
    const c = item[campusName];
    const lines = [`## ${campusName}`, ''];
    if (Array.isArray(c.name)) {
      lines.push(`**Also known as:** ${c.name.join(', ')}`, '');
    }
    if (c.gate_closing_time != null) lines.push(`**Gate closing time:** ${c.gate_closing_time}`, '');
    if (Array.isArray(c.dorm_types)) lines.push(`**Dorm types:** ${c.dorm_types.join('; ')}`, '');
    if (Array.isArray(c.utilities)) lines.push(`**Utilities:** ${c.utilities.join('; ')}`, '');
    if (c.cleaning_schedule != null && c.cleaning_schedule !== '') {
      lines.push(`**Cleaning / maintenance:** ${c.cleaning_schedule}`, '');
    }
    if (c.map && typeof c.map === 'object') {
      lines.push('**Map links (Google Maps):**', '');
      for (const [place, url] of Object.entries(c.map)) {
        lines.push(`- **${place}:** ${url}`);
      }
    }
    parts.push(lines.join('\n'));
  }
  return parts.join('\n\n---\n\n');
}

function jsonToText(obj, depth = 0) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  const indent = '  '.repeat(depth);
  if (Array.isArray(obj)) {
    return obj.map((v) => `${indent}- ${jsonToText(v, depth + 1)}`).join('\n');
  }
  return Object.entries(obj)
    .map(([k, v]) => {
      const child = jsonToText(v, depth + 1);
      const isMulti = child.includes('\n');
      return isMulti ? `${indent}${k}:\n${child}` : `${indent}${k}: ${child}`;
    })
    .join('\n');
}

async function parseJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const obj = JSON.parse(raw);
  const slug = path.basename(filePath, path.extname(filePath));

  /** @type {string} */
  let title;
  /** @type {string} */
  let text;

  if (isKnowledgeTopicArray(obj)) {
    title = 'Ambo University knowledge base';
    text = formatKnowledgeTopicArray(obj);
  } else if (isCampusLocationsArray(obj)) {
    title = 'Ambo University campus locations and maps';
    text = formatCampusLocationsArray(obj);
  } else if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    title =
      (typeof obj.title === 'string' && obj.title) ||
      (typeof obj.name === 'string' && obj.name) ||
      (typeof obj.heading === 'string' && obj.heading) ||
      slug.replace(/[_-]/g, ' ');
    text = jsonToText(obj);
  } else {
    title = slug.replace(/[_-]/g, ' ');
    text = jsonToText(obj);
  }

  const combined = `${text.trim()}\n\n${HIRIYA_ATTRIBUTION_FOOTER}\n`;

  return {
    title,
    text: combined,
    metadata: { format: 'json', sourceFile: path.basename(filePath) },
  };
}

export async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return parsePdf(filePath);
    case '.md':
    case '.mdx':
      return parseMarkdown(filePath);
    case '.html':
    case '.htm':
      return parseHtml(filePath);
    case '.json':
      return parseJson(filePath);
    case '.txt':
      return parsePlain(filePath);
    default:
      return null; // unsupported, skip
  }
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.md', '.mdx', '.html', '.htm', '.json', '.txt'];
