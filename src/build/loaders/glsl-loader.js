const glslman = require('glsl-man');

function minify(code) {
  return glslman.string(glslman.parse(code), { tab: '', space: '', newline: '' });
}

module.exports = function glslLoader(content) {
  this.cacheable && this.cacheable();
  this.value = content;
  return `module.exports = ${JSON.stringify(minify(content))}`;
};
