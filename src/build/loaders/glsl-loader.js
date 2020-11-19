const fs = require('fs');
const path = require('path');
const glslman = require('glsl-man');

const regex = /#include "(.*)"/g;

function minify(code) {
  return glslman.string(glslman.parse(code), { tab: '', space: '', newline: '' });
}

module.exports = function glslLoader(content) {
  this.cacheable && this.cacheable();

  const source = content.replace(regex, match => {
    const [, file] = match.split('"');

    return fs.readFileSync(path.resolve(this.context, file));
  });

  return `module.exports = ${JSON.stringify(minify(source))}`;
};
