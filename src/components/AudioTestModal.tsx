import React, { useState } from 'react';
import { Volume2, VolumeX, X, Zap, Mic, Music, Settings2 } from 'lucide-react';
import { AudioSettings, Language } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { getTranslation } from '../utils/i18n';

interface AudioTestModalProps {
  language: Language;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
  onClose: () => void;
}

export const AudioTestModal: React.FC<AudioTestModalProps> = ({
  language,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const t = getTranslation(language);
  const [isPlayingGun, setIsPlayingGun] = useState(false);
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.setMasterVolume(val);
    onUpdateSettings({ ...settings, masterVolume: val });
  };

  const testStarterGun = () => {
    setIsPlayingGun(true);
    audioEngine.playStarterGun(settings.gunBassBoost);
    setTimeout(() => setIsPlayingGun(false), 500);
  };

  const testToneScale = async () => {
    setIsPlayingScale(true);
    audioEngine.playTone(880, 0.2); // 3s
    await new Promise((r) => setTimeout(r, 400));
    audioEngine.playTone(660, 0.2); // 2s
    await new Promise((r) => setTimeout(r, 400));
    audioEngine.playTone(440, 0.2); // 1s
    await new Promise((r) => setTimeout(r, 400));
    setIsPlayingScale(false);
  };

  const testSpeechVoice = () => {
    setIsPlayingSpeech(true);
    const phrase = `${t.prepText}，${t.num3Text}、${t.num2Text}、${t.num1Text}！`;
    audioEngine.speakText(phrase, language);
    setTimeout(() => setIsPlayingSpeech(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">{t.audioTestModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Volume Slider */}
        <div className="mb-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              {settings.masterVolume > 0 ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
              {t.masterVolumeLabel}
            </span>
            <span className="font-mono text-amber-400">
              {Math.round(settings.masterVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.masterVolume}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-5 text-xs font-medium bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-zinc-300">{t.prepPhraseToggle}</span>
            <input
              type="checkbox"
              checked={settings.enablePrepPhrase}
              onChange={(e) =>
                onUpdateSettings({ ...settings, enablePrepPhrase: e.target.checked })
              }
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-zinc-300">{t.bassBoostToggle}</span>
            <input
              type="checkbox"
              checked={settings.gunBassBoost}
              onChange={(e) =>
                onUpdateSettings({ ...settings, gunBassBoost: e.target.checked })
              }
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Audio Test Triggers */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-zinc-500 mb-1">
            {t.testSectionTitle}
          </div>

          {/* Test Starter Gun */}
          <button
            onClick={testStarterGun}
            className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between font-semibold text-xs transition-all ${
              isPlayingGun
                ? 'bg-red-600 border-red-500 text-white scale-[0.98]'
                : 'bg-zinc-800 border-zinc-700/60 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {t.testGunBtn}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">💥</span>
          </button>

          {/* Test Tone Scale */}
          <button
            onClick={testToneScale}
            disabled={isPlayingScale}
            className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between font-semibold text-xs transition-all ${
              isPlayingScale
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-zinc-800 border-zinc-700/60 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400" />
              {t.testToneBtn}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">🎵</span>
          </button>

          {/* Test Speech Voice */}
          <button
            onClick={testSpeechVoice}
            disabled={isPlayingSpeech}
            className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between font-semibold text-xs transition-all ${
              isPlayingSpeech
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-zinc-800 border-zinc-700/60 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-400" />
              {t.testSpeechBtn}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">🗣️</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md"
        >
          {t.doneSetting}
        </button>
      </div>
    </div>
  );
};
