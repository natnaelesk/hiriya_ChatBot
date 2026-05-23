import { logger } from '../lib/logger.js';

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Brian
const VOICE_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.85,
  style: 0.4,
  use_speaker_boost: true,
};
const MODEL_ID = 'eleven_multilingual_v2';
const MAX_CHARS = 1000;

export async function synthesize(text, opts = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    const err = new Error('ELEVENLABS_API_KEY missing');
    err.status = 503;
    err.expose = true;
    throw err;
  }

  const voiceId = opts.voiceId || DEFAULT_VOICE_ID;
  const cleanText = String(text ?? '').slice(0, MAX_CHARS).trim();
  if (!cleanText) {
    const err = new Error('Empty text');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    }),
  });

  if (!resp.ok) {
    let detail = '';
    try {
      detail = await resp.text();
    } catch {
      // ignore
    }
    logger.warn('elevenlabs error', { status: resp.status, detail });
    const err = new Error(`ElevenLabs ${resp.status}`);
    err.status = resp.status === 401 ? 502 : resp.status;
    err.expose = true;
    throw err;
  }

  return resp.body; // ReadableStream of audio/mpeg
}
