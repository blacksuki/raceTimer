import React, { useEffect, useState } from 'react';

import { Language } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { getTranslation } from '../utils/i18n';
import { MuzzleFlash } from './MuzzleFlash';

interface CountdownOverlayProps {
  language: Language;
  enablePrep: boolean;
  onFinish: () => void;
  onCancel: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  language,
  enablePrep,
  onFinish,
  onCancel,
}) => {
  const [step, setStep] = useState<'prep' | '3' | '2' | '1' | 'bang'>('prep');
  const [flashTrigger, setFlashTrigger] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runCountdown = async () => {
      // Step 0: Prep Phrase (if enabled)
      if (enablePrep) {
        setStep('prep');
        const prepText = t.prepText;
        audioEngine.speakText(prepText, language);
        await new Promise((resolve) => setTimeout(resolve, 1600));
      }

      // Step 3 (at 3s)
      setStep('3');
      audioEngine.playTone(880, 0.2);
      audioEngine.speakText(t.num3Text, language);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2 (at 2s)
      setStep('2');
      audioEngine.playTone(660, 0.2);
      audioEngine.speakText(t.num2Text, language);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 1 (at 1s)
      setStep('1');
      audioEngine.playTone(440, 0.2);
      audioEngine.speakText(t.num1Text, language);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step BANG (at 0s - Starter Gun!)
      setStep('bang');
      setFlashTrigger(true);
      audioEngine.playStarterGun(true);

      // Instantly start timer
      timeoutId = setTimeout(() => {
        onFinish();
      }, 200);
    };

    runCountdown();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [language, enablePrep, onFinish]);

  const getStepDisplay = () => {
    if (step === 'prep') return t.prepText;
    if (step === '3') return t.num3Text;
    if (step === '2') return t.num2Text;
    if (step === '1') return t.num1Text;
    if (step === 'bang') return t.bangText;
    return '';
  };

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center text-white select-none">
      <MuzzleFlash trigger={flashTrigger} />

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all border border-zinc-700/60 shadow-lg"
      >
        {t.cancelCountdown}
      </button>

      {/* Language badge */}
      <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-800/50 text-xs font-semibold tracking-wider uppercase">
        {language === 'zh-CN' ? '中文 (zh-CN)' : language === 'en-US' ? 'English (en-US)' : '日本語 (ja-JP)'}
      </div>

      {/* Main Countdown Breathing Container */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Pulsing Aura Rings */}
        <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping" />
        <div className="absolute inset-4 rounded-full border-2 border-amber-500/40 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/20 via-orange-500/10 to-amber-500/20 blur-xl" />

        {/* Dynamic Display Text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div
            key={step}
            className={`font-black transition-all duration-300 transform ${
              step === 'prep'
                ? 'text-4xl text-amber-300 tracking-widest animate-pulse'
                : step === 'bang'
                ? 'text-5xl sm:text-6xl text-red-500 scale-125 font-black drop-shadow-[0_0_35px_rgba(239,68,68,1)]'
                : 'text-8xl text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] scale-110 animate-bounce'
            }`}
          >
            {getStepDisplay()}
          </div>

          <div className="mt-6 text-xs text-zinc-400 tracking-wider uppercase font-mono">
            {step === 'prep' ? t.prepStatus : step === 'bang' ? t.bangText : t.countdownStatus}
          </div>
        </div>
      </div>

      {/* Stadium track accent graphic */}
      <div className="absolute bottom-10 flex items-center gap-2 text-zinc-500 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Web Audio API + Speech Engine (3 → 2 → 1 → 🔫)
      </div>
    </div>
  );
};

