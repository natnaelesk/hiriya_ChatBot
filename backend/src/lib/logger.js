// Tiny structured-ish logger. Avoids pulling in pino/winston for a demo.
// Use named levels so we can grep prod logs cleanly.
const levels = ['debug', 'info', 'warn', 'error'];
const minLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
const minIdx = Math.max(0, levels.indexOf(minLevel));

function fmt(level, msg, meta) {
  const ts = new Date().toISOString();
  const base = `${ts} [${level.toUpperCase()}] ${msg}`;
  if (!meta) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} <unserialisable meta>`;
  }
}

function log(level, msg, meta) {
  if (levels.indexOf(level) < minIdx) return;
  const line = fmt(level, msg, meta);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (m, meta) => log('debug', m, meta),
  info: (m, meta) => log('info', m, meta),
  warn: (m, meta) => log('warn', m, meta),
  error: (m, meta) => log('error', m, meta),
};
