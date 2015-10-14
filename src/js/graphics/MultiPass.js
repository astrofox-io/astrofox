var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');

var MultiPass = function(composer) {
    ComposerPass.call(this, {});

    this.composer = composer;

    console.log(composer);
};

Class.extend(MultiPass, ComposerPass, {
    getPasses: function() {
        return this.composer.getPasses();
    },

    render: function(renderer, writeBuffer, readBuffer) {
        var composer = this.composer;

        composer.readTarget = readBuffer;
        composer.writeTarget = writeBuffer;
        //composer.renderToScreen({ blending: THREE.NormalBlending, opacity: 1.0 });

        composer.render();
    }
});

module.exports = MultiPass;