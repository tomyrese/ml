export function clampSpeed(speed: number): number {
  if (isNaN(speed)) {
    return 0.35;
  }
  return Math.max(-1.0, Math.min(1.0, speed));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatFps(fps?: number | null): string {
  if (fps === undefined || fps === null || isNaN(fps)) {
    return '0.0';
  }
  return fps.toFixed(1);
}

export function formatUptime(seconds?: number | null): string {
  if (!seconds || seconds <= 0) {
    return '0s';
  }
  const sec = Math.floor(seconds % 60);
  const min = Math.floor((seconds / 60) % 60);
  const hrs = Math.floor(seconds / 3600);
  if (hrs > 0) {
    return `${hrs}h ${min}m`;
  }
  if (min > 0) {
    return `${min}m ${sec}s`;
  }
  return `${sec}s`;
}
