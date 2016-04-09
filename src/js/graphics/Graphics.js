var THREE = require('three');

var Graphics = {
    getRenderTarget: function(renderer) {
        var pixelRatio = renderer.getPixelRatio(),
            canvas = renderer.context.canvas,
            width = Math.floor(canvas.width / pixelRatio) || 1,
            height = Math.floor(canvas.height / pixelRatio) || 1;

        return new THREE.WebGLRenderTarget(
            width,
            height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                stencilBuffer: true
            }
        );
    }
};

module.exports = Graphics;