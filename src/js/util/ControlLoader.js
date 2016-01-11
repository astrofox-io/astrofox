'use strict';

var _ = require('lodash');
var DisplayLibrary = require('display/DisplayLibrary.js');
var EffectsLibrary = require('effects/EffectsLibrary.js');
var ControlLibrary = require('display/ControlLibrary.js');
var Scene = require('display/Scene.js');
var SceneControl = require('ui/controls/SceneControl.jsx');

var ControlLoader = {
    mapping: {
        // Displays
        BarSpectrumDisplay: ControlLibrary.BarSpectrumControl,
        GeometryDisplay: ControlLibrary.GeometryControl,
        ImageDisplay: ControlLibrary.ImageControl,
        SoundwaveDisplay: ControlLibrary.SoundwaveControl,
        TextDisplay: ControlLibrary.TextControl,

        // Effects
        BlurEffect: ControlLibrary.BlurControl,
        DotScreenEffect: ControlLibrary.DotScreenControl,
        GlowEffect: ControlLibrary.GlowControl,
        HexagonEffect: ControlLibrary.HexagonControl,
        LEDEffect: ControlLibrary.LEDControl,
        MirrorEffect: ControlLibrary.MirrorControl,
        PixelateEffect: ControlLibrary.PixelateControl,
        RGBShiftEffect: ControlLibrary.RGBShiftControl
    },

    getControl: function(obj) {
        var control = null,
            displays = _.assign({}, DisplayLibrary, EffectsLibrary);

        if (obj instanceof Scene) {
            return SceneControl;
        }

        _.forIn(displays, function(val, key) {
            if (obj instanceof val) {
                control = this.mapping[key];
                return false;
            }
        }, this);

        return control;
    }
};

module.exports = ControlLoader;

