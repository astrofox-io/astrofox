const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

export function padLeft(n, len, c) {
    n = n + '';
    c = c || '0';
    len = len - n.length;

    let i = -1;
    while (++i < len) {
        n = c + n;
    }

    return n;
}

export function formatSize(val, decimals) {
    if (val === 0) return 'N/A';

    let precision = Math.pow(10, decimals || 0);
    let i = Math.floor(Math.log(val) / Math.log(1024));

    return Math.round(val * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
}

export function parseTime(val) {
    let days = ~~(val / 86400),
        hours = ~~(val / 3600) - (days * 24),
        minutes = ~~(val / 60) - (days * 1440) - (hours * 60),
        seconds = ~~val - (days * 86400) - (hours * 3600) - (minutes * 60),
        ms = Math.round((val - ~~val) * 1000);

    return {
        days, hours, minutes, seconds, ms
    };
}

export function formatTime(val, options) {
    let t = '',
        formats = options || ['m','ms'],
        { days, hours, minutes, seconds, ms } = parseTime(val);

    if (days > 0 && 'd' in formats) t += days + 'd';
    if (hours > 0 && 'h' in formats) t += hours + 'h';
    if (minutes > 0 && 'm' in formats) t += minutes + 'm';
    if (seconds > 0 && 's' in formats) t += seconds + 's';
    if (ms > 0 && 'ms' in formats) t += ms + 'ms';

    return t;
}

export function formatSeekTime(val) {
    let { hours, minutes, seconds, ms } = parseTime(val);

    return (hours > 0 ? (hours < 10 ? '0'+hours : hours) + ':' : '') +
        (minutes < 10 ? '0'+minutes : minutes) + ':' +
        (seconds < 10 ? '0'+seconds : seconds) + '.' +
        (ms == 0 ? '000' : ms);
}