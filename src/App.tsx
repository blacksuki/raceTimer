import React, { useEffect, useState } from 'react';
import {
  AudioSettings,
  LaneRunner,
  Language,
  LapRecord,
  RaceHistoryRecord,
  RaceMode,
} from './types';
import { MobileFrame } from './components/MobileFrame';
import { CountdownOverlay } from './components/CountdownOverlay';
import { SingleTimerView } from './components/SingleTimerView';
import { EightLaneView } from './components/EightLaneView';
import { AudioTestModal } from './components/AudioTestModal';
import { HistoryModal } from './components/HistoryModal';
import { audioEngine } from './utils/audioEngine';

const LOCAL_STORAGE_KEY = 'race_timer_history_v1';

export default function App() {
  const [mode, setMode] = useState<RaceMode>('single');
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [showCountdown, setShowCountdown] = useState(false);
  const [isRunningFromCountdown, setIsRunningFromCountdown] = useState(false);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 0.9,
    speechRateZh: 0.85,
    speechRateEn: 0.9,
    speechRateJa: 0.8,
    enablePrepPhrase: true,
    gunBassBoost: true,
  });

  const [history, setHistory] = useState<RaceHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAudioTestModal, setShowAudioTestModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Sync history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [history]);

  const handleStartCountdown = () => {
    setShowCountdown(true);
  };

  const handleCountdownFinish = () => {
    setShowCountdown(false);
    setIsRunningFromCountdown(true);
  };

  const handleCountdownCancel = () => {
    setShowCountdown(false);
    setIsRunningFromCountdown(false);
  };

  // Save single lap race session
  const handleSaveSingleRace = (title: string, totalTime: number, laps: LapRecord[]) => {
    const newRecord: RaceHistoryRecord = {
      id: 'race_' + Date.now(),
      date: new Date().toLocaleString(),
      mode: 'single',
      language: language,
      title: title || '单人计圈练习',
      totalTime: totalTime,
      laps: laps,
    };
    setHistory((prev) => [newRecord, ...prev]);
  };

  // Save 8-lane race session
  const handleSaveEightLaneRace = (title: string, totalTime: number, lanes: LaneRunner[]) => {
    const newRecord: RaceHistoryRecord = {
      id: 'race_' + Date.now(),
      date: new Date().toLocaleString(),
      mode: 'eight_lane',
      language: language,
      title: title || '8 跑道赛事',
      totalTime: totalTime,
      lanes: lanes,
    };
    setHistory((prev) => [newRecord, ...prev]);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空全部历史比赛记录吗？')) {
      setHistory([]);
    }
  };

  return (
    <MobileFrame
      mode={mode}
      onSelectMode={setMode}
      language={language}
      onChangeLanguage={setLanguage}
      onOpenAudioTest={() => setShowAudioTestModal(true)}
      onOpenHistory={() => setShowHistoryModal(true)}
      historyCount={history.length}
    >
      {/* View 1: Single Runner Mode */}
      {mode === 'single' ? (
        <SingleTimerView
          language={language}
          onStartCountdown={handleStartCountdown}
          onSaveRace={handleSaveSingleRace}
          isRunningFromCountdown={isRunningFromCountdown}
          setIsRunningFromCountdown={setIsRunningFromCountdown}
        />
      ) : (
        /* View 2: 8-Lane Sync Race Mode */
        <EightLaneView
          language={language}
          onStartCountdown={handleStartCountdown}
          onSaveEightLaneRace={handleSaveEightLaneRace}
          isRunningFromCountdown={isRunningFromCountdown}
          setIsRunningFromCountdown={setIsRunningFromCountdown}
        />
      )}

      {/* Countdown Overlay Layer */}
      {showCountdown && (
        <CountdownOverlay
          language={language}
          enablePrep={audioSettings.enablePrepPhrase}
          onFinish={handleCountdownFinish}
          onCancel={handleCountdownCancel}
        />
      )}

      {/* Modals */}
      {showAudioTestModal && (
        <AudioTestModal
          language={language}
          settings={audioSettings}
          onUpdateSettings={(newSettings) => {
            setAudioSettings(newSettings);
            audioEngine.setMasterVolume(newSettings.masterVolume);
          }}
          onClose={() => setShowAudioTestModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          language={language}
          history={history}
          onDeleteRecord={handleDeleteHistoryRecord}
          onClearHistory={handleClearHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </MobileFrame>
  );
}
