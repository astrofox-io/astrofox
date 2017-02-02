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

export function formatTime(val, pad, ms) {
    let hours = ~~(val / 3600);
    let minutes = ~~((val - (hours * 3600)) / 60);
    let seconds = ~~val - (hours * 3600) - (minutes * 60);
    let milliseconds = Math.round((val - ~~val) * 1000) / 1000;

    if (hours < 10 && pad) hours = '0' + hours;
    if (minutes < 10 && pad) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    let format = ((hours > 0) ? hours + ':' : '') + minutes + ':' + seconds;

    if (ms) format += '.' + padLeft((milliseconds + '').substr(2, 3), 3);

    return format;
}