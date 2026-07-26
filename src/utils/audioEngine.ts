import { Language } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.9;

  constructor() {
    // AudioContext lazily initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.volume;
  }

  /**
   * Play tone chime per second:
   * 3s: 880Hz
   * 2s: 660Hz
   * 1s: 440Hz
   */
  public playTone(freq: number, duration: number = 0.18) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  /**
   * Synthesize Starter Gun Shot (拟真发令枪声):
   * White noise burst with lowpass sweep (2000Hz -> 80Hz)
   * plus square low-frequency oscillator rumble (150Hz -> 30Hz)
   */
  public playStarterGun(bassBoost: boolean = true) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      // 1. Noise Buffer Generation
      const bufferSize = this.ctx.sampleRate * 0.35; // 0.35s
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filter: Low pass sweep 2000Hz -> 80Hz
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(1.0, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.32);

      // 2. Low Frequency Impact Rumble (150Hz -> 30Hz square/saw wave)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = bassBoost ? 'sawtooth' : 'triangle';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + 0.3);
    } catch (e) {
      console.warn('Starter gun audio error:', e);
    }
  }

  /**
   * Speak countdown text or prep phrase via Web Speech API
   */
  public speakText(text: string, lang: Language, customRate?: number) {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // Rate defaults per spec: zh-CN: 0.85, en-US: 0.90, ja-JP: 0.80
      let rate = customRate;
      if (!rate) {
        if (lang === 'zh-CN') rate = 0.85;
        else if (lang === 'en-US') rate = 0.90;
        else if (lang === 'ja-JP') rate = 0.80;
        else rate = 0.85;
      }
      utterance.rate = rate;
      utterance.volume = this.volume;

      // Try finding appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = lang.split('-')[0];
      const matchVoice = voices.find((v) => v.lang.replace('_', '-').startsWith(langPrefix) || v.lang === lang);
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public getPrepPhrase(lang: Language): string {
    switch (lang) {
      case 'zh-CN':
        return '各就各位';
      case 'en-US':
        return 'On your marks';
      case 'ja-JP':
        return '位置について';
      default:
        return '各就各位';
    }
  }

  public getCountdownNumberText(num: number, lang: Language): string {
    if (num === 3) {
      if (lang === 'en-US') return 'Three';
      return '三';
    } else if (num === 2) {
      if (lang === 'en-US') return 'Two';
      return '二';
    } else if (num === 1) {
      if (lang === 'en-US') return 'One';
      return '一';
    }
    return '';
  }
}

export const audioEngine = new AudioEngine();
