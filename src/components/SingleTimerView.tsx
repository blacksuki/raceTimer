import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Flag, Save, Zap } from 'lucide-react';
import { LapRecord, Language } from '../types';
import { formatTimeMs } from '../utils/exportUtils';
import { getTranslation } from '../utils/i18n';

interface SingleTimerViewProps {
  language: Language;
  onStartCountdown: () => void;
  onSaveRace: (title: string, totalTime: number, laps: LapRecord[]) => void;
  isRunningFromCountdown: boolean;
  setIsRunningFromCountdown: (val: boolean) => void;
}

export const SingleTimerView: React.FC<SingleTimerViewProps> = ({
  language,
  onStartCountdown,
  onSaveRace,
  isRunningFromCountdown,
  setIsRunningFromCountdown,
}) => {
  const t = getTranslation(language);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [raceTitle, setRaceTitle] = useState(t.singleDefaultTitle);

  // Sync title with language if unchanged
  useEffect(() => {
    setRaceTitle(t.singleDefaultTitle);
  }, [language]);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Triggered when countdown overlay finishes and fires starter gun
  useEffect(() => {
    if (isRunningFromCountdown) {
      startTimer();
      setIsRunningFromCountdown(false);
    }
  }, [isRunningFromCountdown]);

  const updateTimer = () => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      setElapsedTime(accumulatedTimeRef.current + (now - startTimeRef.current));
      animFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const pauseTimer = () => {
    if (isRunning && startTimeRef.current !== null) {
      setIsRunning(false);
      accumulatedTimeRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    if (!isRunning && elapsedTime === 0) return;

    const previousSplit = laps.length > 0 ? laps[0].splitTime : 0;
    const currentSplit = elapsedTime;
    const currentLapTime = currentSplit - previousSplit;

    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      lapTime: currentLapTime,
      splitTime: currentSplit,
    };

    // Prepend so latest lap is on top
    setLaps((prev) => [newLap, ...prev]);
  };

  // Find fastest and slowest lap times
  let fastestTime = Infinity;
  let slowestTime = -Infinity;

  if (laps.length > 1) {
    laps.forEach((l) => {
      if (l.lapTime < fastestTime) fastestTime = l.lapTime;
      if (l.lapTime > slowestTime) slowestTime = l.lapTime;
    });
  }

  const handleSave = () => {
    if (elapsedTime === 0) return;
    onSaveRace(raceTitle || t.singleDefaultTitle, elapsedTime, laps);
    alert(t.savedAlertSingle);
  };

  return (
    <div className="flex flex-col h-full justify-between p-3.5 bg-zinc-950 text-white select-none overflow-hidden">
      {/* Title & Editable Label */}
      <div className="flex items-center justify-between mb-1">
        <input
          type="text"
          value={raceTitle}
          onChange={(e) => setRaceTitle(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500 w-full mr-2"
          placeholder={t.singleTitlePlaceholder}
        />
        {elapsedTime > 0 && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            {t.saveResult}
          </button>
        )}
      </div>

      {/* Main Digital Display */}
      <div className="relative my-2 py-5 px-4 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-2xl flex flex-col items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-red-600/5 blur-xl pointer-events-none rounded-2xl" />

        <div className="text-[11px] font-mono text-zinc-400 mb-1 tracking-widest uppercase">
          {isRunning ? t.timingInProgress : t.ready}
        </div>

        {/* Large Time Display */}
        <div className="font-mono text-4xl sm:text-5xl leading-snug py-1 font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center min-h-[64px]">
          {formatTimeMs(elapsedTime)}
        </div>

        {/* Current Lap Split Info */}
        {laps.length > 0 && (
          <div className="mt-1 text-xs font-mono text-amber-400/90">
            {t.lastLap}: {formatTimeMs(laps[0].lapTime)}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {/* Starter Gun Countdown Launch Button */}
        <button
          onClick={onStartCountdown}
          disabled={isRunning}
          className="col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
          {t.gunStart}
        </button>

        {/* Play/Pause Button */}
        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Pause className="w-4 h-4 fill-current shrink-0" />
            {t.pause}
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            {t.directStart}
          </button>
        )}

        {/* Lap Button */}
        <button
          onClick={recordLap}
          disabled={!isRunning}
          className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all border border-zinc-700/50"
        >
          <Flag className="w-4 h-4 shrink-0" />
          {t.lapSplit}
        </button>

        {/* Reset Button */}
        <button
          onClick={resetTimer}
          className="col-span-2 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-zinc-800"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          {t.resetTimer}
        </button>
      </div>

      {/* Lap Times Record List */}
      <div className="flex-1 overflow-y-auto max-h-48 bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-2 space-y-1">
        <div className="text-[10px] font-mono text-zinc-500 px-2 py-1 flex justify-between border-b border-zinc-800">
          <span>{t.lapNumber}</span>
          <span>{t.splitTime}</span>
          <span>{t.totalTime}</span>
        </div>

        {laps.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-600">{t.emptyLapsHint}</div>
        ) : (
          laps.map((lap) => {
            const isFastest = laps.length > 1 && lap.lapTime === fastestTime;
            const isSlowest = laps.length > 1 && lap.lapTime === slowestTime;

            return (
              <div
                key={lap.lapNumber}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isFastest
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                    : isSlowest
                    ? 'bg-red-950/60 text-red-300 border border-red-800/50'
                    : 'bg-zinc-800/40 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">#{lap.lapNumber}</span>
                  {isFastest && (
                    <span className="text-[9px] bg-emerald-800/80 text-emerald-200 px-1 py-0.2 rounded font-sans font-bold">
                      {t.fastest}
                    </span>
                  )}
                  {isSlowest && (
                    <span className="text-[9px] bg-red-800/80 text-red-200 px-1 py-0.2 rounded font-sans font-bold">
                      {t.slowest}
                    </span>
                  )}
                </div>
                <div className="font-semibold">{formatTimeMs(lap.lapTime)}</div>
                <div className="text-zinc-400">{formatTimeMs(lap.splitTime)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

