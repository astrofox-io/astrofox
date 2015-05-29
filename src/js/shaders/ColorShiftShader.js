var fs = require('fs');

var ColorShiftShader = {
    uniforms: {
        time: { type: 'f', value: 1.0 }
    },

    vertexShader: fs.readFileSync(__dirname + '/glsl/basic.vertex.glsl', 'utf8'),
    fragmentShader: fs.readFileSync(__dirname + '/glsl/color-shift.fragment.glsl', 'utf8')
};

module.exports = ColorShiftShader;