const fs = require("fs");
const path = require("path");
const glslman = require("glsl-man");

const regex = /#include "(.*)"/g;

function minify(code) {
	return glslman.string(glslman.parse(code), {
		tab: "",
		space: "",
		newline: "",
	});
}

function parseInclude(match, context, imports) {
	const [, file] = match.split('"');

	const filePath = path.resolve(context, file);

	if (!imports[filePath]) {
		imports[filePath] = fs.readFileSync(filePath, "utf-8");

		// eslint-disable-next-line no-use-before-define
		return parseContent(imports[filePath], path.dirname(filePath), imports);
	}

	return imports[filePath];
}

function parseContent(content, context, imports) {
	return content.replace(regex, (match) =>
		parseInclude(match, context, imports),
	);
}

module.exports = function glslLoader(content) {
	const source = parseContent(content, this.context, {});

	return `module.exports = ${JSON.stringify(minify(source))}`;
};
