import path from 'path';

export function replaceExt(file, ext) {
    const base = path.basename(file, path.extname(file)) + ext;
    return path.join(path.dirname(file), base);
}

export default {
    replaceExt,
};
