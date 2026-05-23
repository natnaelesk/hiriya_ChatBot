// Tiny Server-Sent Events helper. Each event is a single JSON object so the
// frontend can `JSON.parse()` without per-line parsing rules.

export function openSseStream(res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  function send(event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  function close() {
    try {
      res.end();
    } catch {
      // ignore
    }
  }

  return { send, close };
}
