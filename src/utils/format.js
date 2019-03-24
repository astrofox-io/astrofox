const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(val, decimals) {
  if (val === 0) return 'N/A';

  const precision = 10 ** (decimals || 0);
  const i = Math.floor(Math.log(val) / Math.log(1024));

  return `${Math.round((val * precision) / 1024 ** i) / precision} ${sizes[i]}`;
}

export function parseTime(val) {
  const days = ~~(val / 86400);
  const hours = ~~(val / 3600) - days * 24;
  const minutes = ~~(val / 60) - days * 1440 - hours * 60;
  const seconds = ~~val - days * 86400 - hours * 3600 - minutes * 60;
  const ms = (val - ~~val) * 1000;

  return {
    days,
    hours,
    minutes,
    seconds,
    ms,
  };
}

export function formatTime(val) {
  const { hour, minutes, seconds } = parseTime(val);
  const h = hour > 0 ? `${hour}:` : '';
  const m = hour > 0 ? minutes.toString().padStart(2, '0') : minutes;
  const s = seconds.toString().padStart(2, '0');

  return `${h}${m}:${s}`;
}

export function formatShortTime(val, formats = ['m', 'ms']) {
  const { days, hours, minutes, seconds, ms } = parseTime(val);
  let t = '';

  if (days > 0 && formats.indexOf('d') !== -1) t += `${days}d`;
  if (hours > 0 && formats.indexOf('h') !== -1) t += `${hours}h`;
  if (minutes > 0 && formats.indexOf('m') !== -1) t += `${minutes}m`;
  if (seconds > 0 && formats.indexOf('s') !== -1) t += `${seconds}s`;
  if (ms > 0 && formats.indexOf('ms') !== -1) t += `${ms}ms`;

  return t;
}

export function parseSeekTime(val) {
  const matches = val.match(/^(0?\d+:)?(0?\d+):(\d{2})$/);

  if (matches) {
    const h = matches[1] !== undefined ? Number(matches[1].replace(':', '')) * 3600 : 0;
    const m = Number(matches[2]) * 60;
    const s = Number(matches[3]);

    return h + m + s;
  }

  return null;
}

export function formatSeekTime(val) {
  const { hours, minutes, seconds } = parseTime(val);

  return [
    `${hours}`.padStart(2, '0'),
    `${minutes}`.padStart(2, '0'),
    `${seconds}`.padStart(2, '0'),
  ].join(':');
}
