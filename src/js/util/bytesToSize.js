var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
var precision;
var i;

module.exports = (bytes, n) => {
    if (bytes === 0) return 'N/A';
    n = n !== undefined ? n : 0;
    precision = Math.pow(10, n);
    i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round(bytes*precision / Math.pow(1024, i))/precision + ' ' + sizes[i];
};