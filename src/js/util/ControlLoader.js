'use strict';

var _ = require('lodash');
var DisplayLibrary = require('display/DisplayLibrary.js');
var EffectLibrary = require('display/EffectLibrary.js');
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
        // FX
        RGBShiftDisplay: ControlLibrary.RGBShiftControl,
        DotScreenDisplay: ControlLibrary.DotScreenControl,
        DotMatrixDisplay: ControlLibrary.DotMatrixControl,
        MirrorDisplay: ControlLibrary.MirrorControl
    },

    getControl: function(obj) {
        var control = null,
            displays = _.assign({}, DisplayLibrary, EffectLibrary);

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

