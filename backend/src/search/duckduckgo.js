import { load as loadHtml } from 'cheerio';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../lib/logger.js';

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT_MS = Number(process.env.WEB_SEARCH_TIMEOUT_MS ?? 8000);
const DEFAULT_MAX_RESULTS = Number(process.env.WEB_SEARCH_MAX_RESULTS ?? 5);

function isEnabled() {
  return (process.env.WEB_SEARCH_ENABLED ?? 'true').toLowerCase() !== 'false';
}

function clampResults(n) {
  const parsed = Number.isFinite(n) ? n : DEFAULT_MAX_RESULTS;
  return Math.max(1, Math.min(10, parsed));
}

function truncate(s, max = 1200) {
  const text = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function unwrapDuckUrl(href) {
  try {
    const url = new URL(href, 'https://duckduckgo.com');
    const uddg = url.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : url.toString();
  } catch {
    return String(href ?? '').trim();
  }
}

function isMapServiceUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    return (
      host === 'maps.google.com' ||
      host === 'google.com' && parsed.pathname.startsWith('/maps') ||
      host === 'maps.app.goo.gl' ||
      host === 'goo.gl' && parsed.pathname.toLowerCase().includes('maps')
    );
  } catch {
    return false;
  }
}

function appendWebResult(out, { title, url, snippet }, maxResults) {
  if (out.length >= clampResults(maxResults)) return;
  if (!title || !url || isMapServiceUrl(url)) return;
  out.push({
    id: `web-source-${out.length + 1}`,
    type: 'web',
    title,
    source: url,
    url,
    score: null,
    snippet: truncate(snippet),
  });
}

export function normalizeDuckDuckGoHtml(html, { maxResults = DEFAULT_MAX_RESULTS } = {}) {
  const $ = loadHtml(html);
  const out = [];

  $('.result').each((_idx, el) => {
    if (out.length >= clampResults(maxResults)) return false;
    const root = $(el);
    const link = root.find('.result__a').first();
    const title = link.text().trim();
    const href = link.attr('href');
    const snippet = root.find('.result__snippet').first().text().trim();
    const url = unwrapDuckUrl(href);
    appendWebResult(out, { title, url, snippet }, maxResults);
  });

  if (out.length > 0) return out;

  $('a.result-link').each((_idx, el) => {
    if (out.length >= clampResults(maxResults)) return false;
    const link = $(el);
    const title = link.text().trim();
    const url = unwrapDuckUrl(link.attr('href'));
    const snippet = link.closest('tr').nextAll('tr').find('.result-snippet').first().text().trim();
    appendWebResult(out, { title, url, snippet }, maxResults);
  });

  return out;
}

export function normalizeDuckDuckGoInstant(payload, { maxResults = DEFAULT_MAX_RESULTS } = {}) {
  const out = [];
  const abstractUrl = String(payload?.AbstractURL ?? '').trim();
  const abstractText = String(payload?.AbstractText ?? '').trim();
  if (abstractUrl && abstractText) {
    appendWebResult(
      out,
      {
        title: String(payload?.Heading ?? 'DuckDuckGo instant answer').trim(),
        url: abstractUrl,
        snippet: abstractText,
      },
      maxResults,
    );
  }

  const topics = Array.isArray(payload?.RelatedTopics) ? payload.RelatedTopics : [];
  for (const topic of topics) {
    if (out.length >= clampResults(maxResults)) break;
    if (Array.isArray(topic?.Topics)) {
      for (const nested of topic.Topics) {
        if (out.length >= clampResults(maxResults)) break;
        appendTopic(out, nested);
      }
    } else {
      appendTopic(out, topic);
    }
  }

  return out.slice(0, clampResults(maxResults));
}

function appendTopic(out, topic) {
  const url = String(topic?.FirstURL ?? '').trim();
  const text = String(topic?.Text ?? '').trim();
  appendWebResult(out, {
    title: text.split(' - ')[0] || `Web result ${out.length + 1}`,
    url,
    snippet: text,
  }, DEFAULT_MAX_RESULTS);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithCurl(url, timeoutMs) {
  const seconds = Math.max(1, Math.ceil(timeoutMs / 1000));
  try {
    const { stdout } = await execFileAsync(
      'curl',
      ['-L', '-sS', '-A', 'Mozilla/5.0', '--max-time', String(seconds), url],
      { timeout: timeoutMs + 1000, maxBuffer: 1024 * 1024 },
    );
    return stdout;
  } catch (err) {
    logger.warn('DuckDuckGo curl fallback failed', { error: err.message });
    return '';
  }
}

export async function searchWeb(query, opts = {}) {
  if (!isEnabled()) return [];

  const maxResults = clampResults(opts.maxResults ?? DEFAULT_MAX_RESULTS);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const htmlParams = new URLSearchParams({ q: query });
    const htmlResp = await fetchWithTimeout(
      `https://lite.duckduckgo.com/lite/?${htmlParams}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/html',
          'User-Agent': 'Mozilla/5.0 HiriyaBot/1.0',
        },
      },
      timeoutMs,
    );

    if (htmlResp.ok) {
      const html = await htmlResp.text();
      const results = normalizeDuckDuckGoHtml(html, { maxResults });
      if (results.length > 0) return results;
    } else {
      logger.warn('DuckDuckGo HTML search failed', { status: htmlResp.status });
    }

    const curlHtml = await fetchWithCurl(`https://lite.duckduckgo.com/lite/?${htmlParams}`, timeoutMs);
    const curlResults = normalizeDuckDuckGoHtml(curlHtml, { maxResults });
    if (curlResults.length > 0) return curlResults;

    const instantParams = new URLSearchParams({
      q: query,
      format: 'json',
      no_html: '1',
      skip_disambig: '1',
    });
    const instantResp = await fetchWithTimeout(
      `https://api.duckduckgo.com/?${instantParams}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
      timeoutMs,
    );
    if (!instantResp.ok) {
      logger.warn('DuckDuckGo instant answer failed', { status: instantResp.status });
      return [];
    }

    const payload = await instantResp.json();
    return normalizeDuckDuckGoInstant(payload, { maxResults });
  } catch (err) {
    logger.warn('web search unavailable', { error: err.message });
    return [];
  }
}
