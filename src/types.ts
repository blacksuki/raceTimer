export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

export type RaceMode = 'single' | 'eight_lane';

export type CountdownStep = 'prep' | '3' | '2' | '1' | 'bang' | 'none';

export type TimerStatus = 'idle' | 'counting' | 'running' | 'paused' | 'finished';

export interface LapRecord {
  lapNumber: number;
  lapTime: number; // in milliseconds
  splitTime: number; // cumulative time in milliseconds
}

export interface LaneRunner {
  id: number; // 1 to 8
  name: string;
  finishTime: number | null; // in milliseconds, null if not finished
  rank: number | null;
  timeDiff: number | null; // diff to 1st place in ms
}

export interface RaceHistoryRecord {
  id: string;
  date: string;
  mode: RaceMode;
  language: Language;
  title: string;
  totalTime: number;
  laps?: LapRecord[];
  lanes?: LaneRunner[];
}

export interface AudioSettings {
  masterVolume: number; // 0.0 to 1.0
  speechRateZh: number; // 0.85
  speechRateEn: number; // 0.90
  speechRateJa: number; // 0.80
  enablePrepPhrase: boolean; // "各就各位" / "On your marks" / "位置について"
  gunBassBoost: boolean;
}
