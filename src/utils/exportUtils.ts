import { RaceHistoryRecord } from '../types';

export function formatTimeMs(ms: number, showMilliseconds: boolean = true): string {
  if (ms < 0 || isNaN(ms)) return '00:00.00';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(ms % 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const padMs = (n: number) => n.toString().padStart(3, '0');

  const timeStr = `${pad(minutes)}:${pad(seconds)}`;
  if (showMilliseconds) {
    return `${timeStr}.${padMs(milliseconds)}`;
  }
  return timeStr;
}

export function downloadCSV(record: RaceHistoryRecord) {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel

  csvContent += `赛跑比赛记录 - ${record.title}\n`;
  csvContent += `日期,${record.date}\n`;
  csvContent += `模式,${record.mode === 'single' ? '单人计圈模式' : '8跑道同步赛事'}\n`;
  csvContent += `倒计时语言,${record.language}\n`;
  csvContent += `总用时,${formatTimeMs(record.totalTime)}\n\n`;

  if (record.mode === 'single' && record.laps && record.laps.length > 0) {
    csvContent += `圈数,单圈用时,累计时间\n`;
    record.laps.forEach((lap) => {
      csvContent += `第 ${lap.lapNumber} 圈,${formatTimeMs(lap.lapTime)},${formatTimeMs(lap.splitTime)}\n`;
    });
  } else if (record.mode === 'eight_lane' && record.lanes) {
    csvContent += `跑道,选手姓名,最终成绩,名次,与第一名分差\n`;
    // sort lanes by rank or lane id
    const sorted = [...record.lanes].sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      return a.id - b.id;
    });

    sorted.forEach((lane) => {
      const timeStr = lane.finishTime ? formatTimeMs(lane.finishTime) : '未冲线';
      const rankStr = lane.rank ? `第 ${lane.rank} 名` : '未完成';
      const diffStr = lane.timeDiff !== null ? `+${(lane.timeDiff / 1000).toFixed(2)}s` : '-';
      csvContent += `第 ${lane.id} 道,${lane.name},${timeStr},${rankStr},${diffStr}\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `race_record_${record.id}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(record: RaceHistoryRecord) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `race_record_${record.id}_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
