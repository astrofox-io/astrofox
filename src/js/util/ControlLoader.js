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
        ImageDisplay: ControlLibrary.ImageControl,
        SoundwaveDisplay: ControlLibrary.SoundwaveControl,
        TextDisplay: ControlLibrary.TextControl,
        GeometryDisplay: ControlLibrary.GeometryControl,
        // Effects
        RGBShiftEffect: ControlLibrary.RGBShiftControl,
        DotScreenEffect: ControlLibrary.DotScreenControl,
        LEDEffect: ControlLibrary.LEDControl,
        MirrorEffect: ControlLibrary.MirrorControl,
        PixelateEffect: ControlLibrary.PixelateControl,
        BlurEffect: ControlLibrary.BlurControl,
        HexagonEffect: ControlLibrary.HexagonControl
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

