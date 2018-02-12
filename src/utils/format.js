const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

export function formatSize(val, decimals) {
    if (val === 0) return 'N/A';

    const precision = 10 ** (decimals || 0);
    const i = Math.floor(Math.log(val) / Math.log(1024));

    return `${Math.round((val * precision) / (1024 ** i)) / precision} ${sizes[i]}`;
}

export function parseTime(val) {
    const days = ~~(val / 86400);
    const hours = ~~(val / 3600) - (days * 24);
    const minutes = ~~(val / 60) - (days * 1440) - (hours * 60);
    const seconds = ~~val - (days * 86400) - (hours * 3600) - (minutes * 60);
    const ms = Math.round((val - ~~val) * 1000);

    return {
        days, hours, minutes, seconds, ms,
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
    const {
        days, hours, minutes, seconds, ms,
    } = parseTime(val);
    let t = '';

    if (days > 0 && formats.indexOf('d') !== -1) t += `${days}d`;
    if (hours > 0 && formats.indexOf('h') !== -1) t += `${hours}h`;
    if (minutes > 0 && formats.indexOf('m') !== -1) t += `${minutes}m`;
    if (seconds > 0 && formats.indexOf('s') !== -1) t += `${seconds}s`;
    if (ms > 0 && formats.indexOf('ms') !== -1) t += `${ms}ms`;

    return t;
}

export function formatSeekTime(val) {
    const {
        hours, minutes, seconds, ms,
    } = parseTime(val);

    return `${(hours > 0 ? `${hours < 10 ? `0${hours}` : hours}:` : '') +
        (minutes < 10 ? `0${minutes}` : minutes)}:${
        seconds < 10 ? `0${seconds}` : seconds}.${
        ms === 0 ? '000' : ms}`;
}
