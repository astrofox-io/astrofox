import path from "path-browserify";

export function replaceExt(file: string, ext: string) {
	const base = path.basename(file, path.extname(file)) + ext;
	return path.join(path.dirname(file), base);
}
