'use strict';

const EventEmitter = require('./EventEmitter.js');
const FrameBuffer = require('../graphics/FrameBuffer.js');

module.exports = {
    Events: new EventEmitter,
    
    FrameBuffers: {
        '2D': new FrameBuffer('2d'),
        '3D': new FrameBuffer('webgl')
    }
};