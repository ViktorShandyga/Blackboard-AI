export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function masteryLabel(accuracy: number): string {
  if (accuracy >= 90) return 'Експертний рівень';
  if (accuracy >= 70) return 'Впевнений рівень';
  if (accuracy >= 40) return 'Базовий рівень';
  return 'Початковий рівень';
}
