var fs = require('fs');

var CopyShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        opacity:  { type: "f", value: 1.0 }
    },

    vertexShader: fs.readFileSync(__dirname + '/glsl/basic.vertex.glsl', 'utf8'),
    fragmentShader: fs.readFileSync(__dirname + '/glsl/copy.fragment.glsl', 'utf8')
};

module.exports = CopyShader;