/**
 * @author alteredq / http://alteredqualia.com/
 */

var ClearMaskPass = function () {

    this.enabled = true;

};

ClearMaskPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        var context = renderer.context;

        context.disable( context.STENCIL_TEST );

    }

};

module.exports = ClearMaskPass;