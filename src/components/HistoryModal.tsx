import React, { useState } from 'react';
import { History, Download, Trash2, X, FileSpreadsheet, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { RaceHistoryRecord, Language } from '../types';
import { downloadCSV, downloadJSON, formatTimeMs } from '../utils/exportUtils';
import { getTranslation } from '../utils/i18n';

interface HistoryModalProps {
  language: Language;
  history: RaceHistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  language,
  history,
  onDeleteRecord,
  onClearHistory,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const t = getTranslation(language);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">{t.historyTitle}</h3>
            <span className="bg-zinc-800 text-amber-400 text-xs px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <History className="w-8 h-8 stroke-1 text-zinc-600" />
              {t.noHistoryMsg}
            </div>
          ) : (
            history.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs transition-all hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {item.title}
                        <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded uppercase">
                          {item.mode === 'single' ? t.singleMode : t.raceMode}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {item.date} | {t.audioLangLabel}: {item.language}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-black text-amber-400">
                        {formatTimeMs(item.totalTime)}
                      </div>
                    </div>
                  </div>

                  {/* Expand / Details Control */}
                  <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-zinc-400">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-center gap-1 hover:text-white transition-all text-[11px]"
                    >
                      {isExpanded ? (
                        <>
                          {t.hideDetail} <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          {t.showDetail} <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {/* Export Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadCSV(item)}
                        className="flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 px-2 py-1 rounded text-[10px] font-semibold transition-all"
                        title="CSV (Excel)"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        CSV
                      </button>

                      <button
                        onClick={() => downloadJSON(item)}
                        className="flex items-center gap-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/60 px-2 py-1 rounded text-[10px] font-semibold transition-all"
                        title="JSON"
                      >
                        <FileCode className="w-3 h-3" />
                        JSON
                      </button>

                      <button
                        onClick={() => onDeleteRecord(item.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-all rounded hover:bg-zinc-800"
                        title={t.clearAllRecords}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-3 bg-zinc-900/80 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
                      {item.mode === 'single' && item.laps && (
                        <div className="space-y-1">
                          <div className="text-zinc-500 text-[10px] border-b border-zinc-800 pb-1 flex justify-between">
                            <span>{t.lapNumber}</span>
                            <span>{t.splitTime}</span>
                            <span>{t.totalTime}</span>
                          </div>
                          {item.laps.map((lap) => (
                            <div key={lap.lapNumber} className="flex justify-between text-zinc-300">
                              <span>#{lap.lapNumber}</span>
                              <span className="text-amber-400">{formatTimeMs(lap.lapTime)}</span>
                              <span className="text-zinc-400">{formatTimeMs(lap.splitTime)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.mode === 'eight_lane' && item.lanes && (
                        <div className="space-y-1">
                          <div className="text-zinc-500 text-[10px] border-b border-zinc-800 pb-1 flex justify-between">
                            <span>{t.runnerName}</span>
                            <span>{t.totalTime}</span>
                            <span>{t.rankCol}</span>
                          </div>
                          {[...item.lanes]
                            .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                            .map((lane) => (
                              <div key={lane.id} className="flex justify-between text-zinc-300">
                                <span>
                                  {lane.name}
                                </span>
                                <span className="text-amber-400">
                                  {lane.finishTime ? formatTimeMs(lane.finishTime) : '-'}
                                </span>
                                <span className="font-bold">
                                  {lane.rank ? `#${lane.rank}` : '-'}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center shrink-0">
            <button
              onClick={onClearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.clearAllRecords}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition-all"
            >
              {t.closeModal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

