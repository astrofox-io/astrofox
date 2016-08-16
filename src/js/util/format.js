const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

function formatSize(val, decimals) {
    if (val === 0) return 'N/A';

    let precision = Math.pow(10, decimals || 0);
    let i = Math.floor(Math.log(val) / Math.log(1024));

    return Math.round(val * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
}

function formatTime(val) {
    let time = Math.ceil(val);
    let hours   = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10 && hours !== '00') minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    let format = minutes + ':' + seconds;
    if (hours !== '00') format = hours + ':' + time;

    return format;
}

module.exports = {
    formatSize,
    formatTime
};