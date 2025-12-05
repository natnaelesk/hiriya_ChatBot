// TTS Service - Brian Voice (ElevenLabs)
class TTSService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;

    // ⚠️ Your API key here
    this.API_KEY = `${import.meta.env.REACT_APP_ELEVENLABS_API_KEY}`;

    // Brian official voice ID
    this.BRIAN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
  }

  async speak(text) {
    this.stop(); // stop any previous

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.BRIAN_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.API_KEY
          },
          body: JSON.stringify({
            text: text.substring(0, 500), // keeps it safe
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.70,
              similarity_boost: 0.85,
              style: 0.4,
              use_speaker_boost: true
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      this.audio = new Audio(url);
      this.audio.play();
      this.isPlaying = true;

      this.audio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(url); // cleanup
      };

      this.audio.onerror = () => {
        console.error("Audio error");
        this.isPlaying = false;
      };

    } catch (err) {
      console.error("ElevenLabs failed, using fallback:", err);

      // fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      this.isPlaying = true;

      utterance.onend = () => {
        this.isPlaying = false;
      };
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    window.speechSynthesis.cancel();
    this.isPlaying = false;
  }
}

const ttsService = new TTSService();
export default ttsService;
