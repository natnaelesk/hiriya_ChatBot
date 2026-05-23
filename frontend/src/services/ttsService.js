// TTS service that proxies through the backend so the ElevenLabs key never
// touches the browser. Falls back to the Web SpeechSynthesis API if the
// backend is unavailable.
import { ttsBlob, ApiError } from './apiClient.js';

class TTSService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this._activeUrl = null;
  }

  async speak(text, getToken) {
    this.stop();
    if (!text) return;

    try {
      const blob = await ttsBlob(text, getToken);
      const url = URL.createObjectURL(blob);
      this._activeUrl = url;

      const audio = new Audio(url);
      this.audio = audio;
      this.isPlaying = true;

      audio.onended = () => {
        this.isPlaying = false;
        this._cleanupActiveUrl();
      };
      audio.onerror = () => {
        this.isPlaying = false;
        this._cleanupActiveUrl();
      };

      try {
        await audio.play();
      } catch {
        this.isPlaying = false;
        this._cleanupActiveUrl();
      }
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      // 503 = key not configured on backend → quietly fall back to browser TTS
      if (status === 503 || status === 0) {
        this._fallback(text);
      } else {
        console.warn('[TTS] backend failed, using browser fallback', err);
        this._fallback(text);
      }
    }
  }

  _fallback(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    this.isPlaying = true;
    utter.onend = () => {
      this.isPlaying = false;
    };
    utter.onerror = () => {
      this.isPlaying = false;
    };
    window.speechSynthesis.speak(utter);
  }

  _cleanupActiveUrl() {
    if (this._activeUrl) {
      try {
        URL.revokeObjectURL(this._activeUrl);
      } catch {
        // ignore
      }
      this._activeUrl = null;
    }
  }

  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // ignore
      }
      this.audio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this._cleanupActiveUrl();
    this.isPlaying = false;
  }
}

const ttsService = new TTSService();
export default ttsService;
