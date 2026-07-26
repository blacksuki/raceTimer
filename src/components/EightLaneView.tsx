import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Save, Zap, CheckCircle2, Pencil, Flag, Square } from 'lucide-react';
import { LaneRunner, Language } from '../types';
import { formatTimeMs } from '../utils/exportUtils';
import { getTranslation } from '../utils/i18n';

interface EightLaneViewProps {
  language: Language;
  onStartCountdown: () => void;
  onSaveEightLaneRace: (title: string, totalTime: number, lanes: LaneRunner[]) => void;
  isRunningFromCountdown: boolean;
  setIsRunningFromCountdown: (val: boolean) => void;
}

export const EightLaneView: React.FC<EightLaneViewProps> = ({
  language,
  onStartCountdown,
  onSaveEightLaneRace,
  isRunningFromCountdown,
  setIsRunningFromCountdown,
}) => {
  const t = getTranslation(language);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lanes, setLanes] = useState<LaneRunner[]>([]);
  const [raceTitle, setRaceTitle] = useState(t.raceDefaultTitle);
  const [editingLaneId, setEditingLaneId] = useState<number | null>(null);

  useEffect(() => {
    setRaceTitle(t.raceDefaultTitle);
  }, [language]);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunningFromCountdown) {
      startRace();
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

  const startRace = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const pauseRace = () => {
    if (isRunning && startTimeRef.current !== null) {
      setIsRunning(false);
      accumulatedTimeRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const resetRace = () => {
    setIsRunning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
    setLanes([]);
  };

  // Record finish time for the next sequential runner (1st click = 第一名, 2nd click = 第二名, etc.)
  const recordNextFinish = () => {
    if (!isRunning && elapsedTime === 0) return;

    setLanes((prevLanes) => {
      const currentCount = prevLanes.length;
      if (currentCount >= 8) return prevLanes;

      const finishMs = elapsedTime;
      const rank = currentCount + 1;
      const rankName = t.ranks[currentCount] || `${rank}`;

      const firstTime = currentCount === 0 ? finishMs : prevLanes[0].finishTime!;
      const timeDiff = currentCount === 0 ? 0 : finishMs - firstTime;

      const newRunner: LaneRunner = {
        id: rank,
        name: rankName,
        finishTime: finishMs,
        rank: rank,
        timeDiff: timeDiff,
      };

      const nextLanes = [...prevLanes, newRunner];

      // Automatically pause race if all 8 runners have finished
      if (nextLanes.length >= 8) {
        setTimeout(() => pauseRace(), 50);
      }

      return nextLanes;
    });
  };

  const finishedCount = lanes.length;
  const isAllFinished = finishedCount >= 8;

  const handleNameChange = (id: number, newName: string) => {
    setLanes((prev) =>
      prev.map((lane) =>
        lane.id === id ? { ...lane, name: newName || t.ranks[id - 1] || `${id}` } : lane
      )
    );
  };

  const handleSave = () => {
    if (elapsedTime === 0) return;
    onSaveEightLaneRace(raceTitle || t.raceDefaultTitle, elapsedTime, lanes);
    alert(t.savedAlertRace);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-amber-400 font-extrabold text-xs sm:text-sm">🥇 1st</span>;
    if (rank === 2) return <span className="text-slate-300 font-bold text-xs">🥈 2nd</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold text-xs">🥉 3rd</span>;
    return <span className="text-zinc-400 font-semibold text-xs">{rank}th</span>;
  };

  return (
    <div className="flex flex-col h-full justify-between p-3 bg-zinc-950 text-white select-none overflow-hidden">
      {/* Title & Save Bar */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <input
          type="text"
          value={raceTitle}
          onChange={(e) => setRaceTitle(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500 w-full"
          placeholder={t.raceTitlePlaceholder}
        />
        {elapsedTime > 0 && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            {t.saveResult}
          </button>
        )}
      </div>

      {/* Synchronized Race Time Header */}
      <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-amber-950/60 border border-red-900/40 rounded-xl p-3 flex flex-col gap-2 shadow-lg mb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-red-400 tracking-wider flex items-center gap-1">
              8-Lane Timer
              <span className="text-zinc-500 font-normal">({finishedCount}/8 {t.runnersFinished})</span>
            </span>
            <span className="font-mono text-3xl font-black text-white tracking-tight leading-snug py-0.5">
              {formatTimeMs(elapsedTime)}
            </span>
          </div>

          {/* Top Control Cluster */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onStartCountdown}
              disabled={isRunning}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow shrink-0"
              title={t.gunStart}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              {t.gunStart}
            </button>

            {!isRunning && (
              <button
                onClick={startRace}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs font-bold transition-all"
                title={t.directStart}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}

            {isRunning && (
              <button
                onClick={pauseRace}
                className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-lg text-xs font-bold transition-all"
                title={t.pause}
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              onClick={resetRace}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-lg text-xs transition-all border border-zinc-700/50"
              title={t.resetTimer}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sequential Record Finish & Overall End Buttons */}
        {(isRunning || (elapsedTime > 0 && !isAllFinished)) && (
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={recordNextFinish}
              disabled={isAllFinished}
              className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/60 transition-all active:scale-[0.98] border border-amber-400/30"
            >
              <Flag className="w-4 h-4 text-amber-300 shrink-0" />
              {t.recordFinish} ({t.ranks[finishedCount] || `${finishedCount + 1}`})
            </button>

            <button
              onClick={pauseRace}
              className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-zinc-700/60 shrink-0"
              title={t.endRaceOverall}
            >
              <Square className="w-3.5 h-3.5 fill-current shrink-0" />
              {t.endRaceOverall}
            </button>
          </div>
        )}

        {isAllFinished && (
          <div className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t.allFinishedMsg}
          </div>
        )}
      </div>

      {/* 8 Track Lanes Container / Results */}
      <div className="flex-1 overflow-y-auto space-y-1.5 my-1 pr-1 max-h-56">
        {lanes.length === 0 ? (
          <div className="flex-1 h-full min-h-[180px] flex flex-col items-center justify-center p-4 text-center bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-2xl my-1">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-xl mb-2 border border-zinc-800">
              ⏱️
            </div>
            <div className="text-xs font-bold text-zinc-300 mb-1">{t.raceReadyTitle}</div>
            <div className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
              {t.raceReadyHint}
            </div>
          </div>
        ) : (
          lanes.map((lane) => (
            <div
              key={lane.id}
              className="flex items-center justify-between p-2 rounded-xl border bg-zinc-900/90 border-emerald-800/60 shadow-md transition-all"
            >
              {/* Rank Badge & Editable Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-500/40">
                  #{lane.rank}
                </span>

                {editingLaneId === lane.id ? (
                  <input
                    type="text"
                    value={lane.name}
                    onChange={(e) => handleNameChange(lane.id, e.target.value)}
                    onBlur={() => setEditingLaneId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingLaneId(null)}
                    autoFocus
                    className="bg-zinc-950 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-white w-28 focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => setEditingLaneId(lane.id)}
                    className="text-xs font-bold text-amber-300 truncate cursor-pointer hover:text-amber-200 flex items-center gap-1"
                    title={t.editNameHint}
                  >
                    {lane.name}
                    <Pencil className="w-3 h-3 text-zinc-500 opacity-60" />
                  </span>
                )}
              </div>

              {/* Time & Rank Badge */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {formatTimeMs(lane.finishTime!)}
                  </span>
                  {lane.timeDiff !== null && lane.timeDiff > 0 && (
                    <span className="font-mono text-[10px] text-zinc-500">
                      +{(lane.timeDiff / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>

                <div className="w-12 flex justify-end">{getRankBadge(lane.rank!)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

