'use strict';

var AstroFox = {};

AstroFox.Player = require('./audio/Player.js');
AstroFox.Sound = require('./audio/Sound.js');
AstroFox.BufferedSound = require('./audio/BufferedSound.js');
AstroFox.MediaElementSound = require('./audio/MediaElementSound.js');
AstroFox.SpectrumAnalyzer = require('./audio/SpectrumAnalyzer.js');
AstroFox.WaveformAnalyzer = require('./audio/WaveformAnalyzer.js');
AstroFox.RenderManager = require('./visual/RenderManager.js');
AstroFox.BarDisplay = require('./visual/BarDisplay.js');
AstroFox.TextDisplay = require('./visual/TextDisplay.js');
AstroFox.ImageDisplay = require('./visual/ImageDisplay.js');
AstroFox.Timer = require('./core/Timer.js');

AstroFox.getAudioContext = function() {
    if (!AstroFox.audioContext) {
        AstroFox.audioContext = new (
            window.AudioContext || window.webkitAudioContext
        );
    }

    return AstroFox.audioContext;
};

AstroFox.getTimer = function() {
    if (!AstroFox.timer) {
        AstroFox.timer = new AstroFox.Timer();
    }

    return AstroFox.timer;
};

window.AstroFox = AstroFox;