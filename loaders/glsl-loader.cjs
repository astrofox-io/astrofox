const fs = require("node:fs");
const path = require("node:path");

const INCLUDE_PATTERN = /^[ \t]*#include\s+["'](.+?)["'][ \t]*$/gm;

function resolveIncludes(source, resourcePath, seen = new Set()) {
	return source.replace(INCLUDE_PATTERN, (_, includePath) => {
		const includeFilePath = path.resolve(
			path.dirname(resourcePath),
			includePath,
		);
		const includeKey = includeFilePath.toLowerCase();

		if (seen.has(includeKey)) {
			return "";
		}

		seen.add(includeKey);
		const includeSource = fs.readFileSync(includeFilePath, "utf8");
		return resolveIncludes(includeSource, includeFilePath, seen);
	});
}

module.exports = function glslLoader(source) {
	const sourceText = Buffer.isBuffer(source) ? source.toString("utf8") : source;
	const seen = new Set([this.resourcePath.toLowerCase()]);
	const resolvedSource = resolveIncludes(sourceText, this.resourcePath, seen);

	return `export default ${JSON.stringify(resolvedSource)};`;
};
