import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

export async function walk(dir, predicate = () => true) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = await readdir(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        const s = await stat(full).catch(() => null);
        if (s && predicate(full, s)) out.push(full);
      }
    }
  }
  return out.sort();
}
