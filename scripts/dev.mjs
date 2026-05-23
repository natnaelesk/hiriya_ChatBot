#!/usr/bin/env node
// Run frontend + backend dev servers together with prefixed output.
// Zero external deps so root install stays slim.
import { spawn } from 'node:child_process';
import process from 'node:process';

const procs = [
  { name: 'backend', color: '\x1b[36m', cmd: 'npm', args: ['--workspace', 'backend', 'run', 'dev'] },
  { name: 'frontend', color: '\x1b[35m', cmd: 'npm', args: ['--workspace', 'frontend', 'run', 'dev'] },
];

const reset = '\x1b[0m';
const children = [];

function pipe(stream, prefix) {
  let buf = '';
  stream.on('data', (chunk) => {
    buf += chunk.toString();
    const lines = buf.split(/\r?\n/);
    buf = lines.pop() ?? '';
    for (const line of lines) process.stdout.write(`${prefix}${line}${reset}\n`);
  });
}

for (const p of procs) {
  const child = spawn(p.cmd, p.args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = `${p.color}[${p.name}]${reset} `;
  pipe(child.stdout, prefix);
  pipe(child.stderr, prefix);
  child.on('exit', (code) => {
    process.stdout.write(`${prefix}exited with code ${code}\n`);
    for (const c of children) if (c.pid !== child.pid) c.kill('SIGTERM');
    process.exit(code ?? 1);
  });
  children.push(child);
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    for (const c of children) c.kill(sig);
  });
}
