import React from 'react';
import { Volume2, History, Languages, Trophy, Users, Timer } from 'lucide-react';
import { Language, RaceMode } from '../types';
import { getTranslation } from '../utils/i18n';

interface MobileFrameProps {
  children: React.ReactNode;
  mode: RaceMode;
  onSelectMode: (mode: RaceMode) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onOpenAudioTest: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  mode,
  onSelectMode,
  language,
  onChangeLanguage,
  onOpenAudioTest,
  onOpenHistory,
  historyCount,
}) => {
  const t = getTranslation(language);

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-zinc-950 to-black flex items-center justify-center p-0 sm:p-4 font-sans text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      {/* Outer Mobile Frame (固定移动竖屏) */}
      <div className="relative w-full max-w-md h-screen sm:h-[840px] sm:max-h-[92vh] bg-zinc-950 sm:border-8 sm:border-zinc-800/90 sm:rounded-[40px] shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col overflow-hidden">
        {/* Top Camera Notch / Bar for Device Feel */}
        <div className="hidden sm:flex justify-center items-center pt-2 pb-1 bg-zinc-950 shrink-0">
          <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-3 h-1 bg-zinc-800 rounded-full" />
          </div>
        </div>

        {/* Status & Quick Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0 select-none">
          {/* Logo Brand */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-black text-zinc-950 text-xs shadow-md">
              ⚡
            </div>
            <span className="font-black text-xs tracking-wider uppercase bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              {t.appTitle}
            </span>
          </div>

          {/* Controls: Audio Test, Language, History */}
          <div className="flex items-center gap-1.5">
            {/* Audio Test Panel Button */}
            <button
              onClick={onOpenAudioTest}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-all border border-zinc-700/60"
              title={t.audioTestTitle}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-zinc-800 rounded-lg border border-zinc-700/60 p-0.5">
              <Languages className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
              <select
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as Language)}
                className="bg-transparent text-[11px] font-semibold text-zinc-200 px-1 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="zh-CN" className="bg-zinc-900 text-white">
                  中文
                </option>
                <option value="en-US" className="bg-zinc-900 text-white">
                  English
                </option>
                <option value="ja-JP" className="bg-zinc-900 text-white">
                  日本語
                </option>
              </select>
            </div>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="relative p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-all border border-zinc-700/60"
              title={t.historyTitle}
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center border border-zinc-900 shadow">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-zinc-900/60 p-1.5 border-b border-zinc-800 flex gap-1 shrink-0 select-none">
          <button
            onClick={() => onSelectMode('single')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'single'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            {t.singleMode}
          </button>

          <button
            onClick={() => onSelectMode('eight_lane')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'eight_lane'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.raceMode}
          </button>
        </div>

        {/* Main Interactive Screen Content */}
        <div className="flex-1 overflow-hidden relative">{children}</div>

        {/* Bottom Track Stadium Graphic Bar */}
        <div className="bg-zinc-900/90 border-t border-zinc-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0 select-none">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Web Audio & Speech Engine
          </span>
          <span>{t.msTiming}</span>
        </div>
      </div>
    </div>
  );
};

