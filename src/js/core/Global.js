'use strict';

const FrameBuffer = require('../graphics/FrameBuffer.js');

module.exports = {
    frameBuffers: {
        '2D': new FrameBuffer('2d'),
        '3D': new FrameBuffer('webgl')
    }
};