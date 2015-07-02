'use strict';

var _ = require('lodash');
var DisplayLibrary = require('display/DisplayLibrary.js');
var ControlLibrary = require('display/ControlLibrary.js');

var ControlLoader = {
    mapping: {
        BarSpectrumDisplay: ControlLibrary.BarSpectrumControl,
        ImageDisplay: ControlLibrary.ImageControl,
        SoundwaveDisplay: ControlLibrary.SoundwaveControl,
        TextDisplay: ControlLibrary.TextControl,
        GeometryDisplay: ControlLibrary.GeometryControl,
        RGBShiftDisplay: ControlLibrary.RGBShiftControl,
        DotScreenDisplay: ControlLibrary.DotScreenControl
    },

    getControl: function(display) {
        var control;

        _.forIn(DisplayLibrary, function(val, key) {
            if (display instanceof val) {
                control = this.mapping[key];
                return false;
            }
        }, this);

        return control;
    }
};

module.exports = ControlLoader;

