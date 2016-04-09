'use strict';

var _ = require('lodash');
var DisplayLibrary = require('../lib/DisplayLibrary.js');
var EffectsLibrary = require('../lib/EffectsLibrary.js');
var ControlLibrary = require('../lib/ControlLibrary.js');
var Scene = require('../display/Scene.js');
var SceneControl = require('../ui/controls/SceneControl.jsx');

var ControlLoader = {
    getControl: function(obj) {
        var name,
            control = null,
            displays = _.assign({}, DisplayLibrary, EffectsLibrary);

        if (obj instanceof Scene) {
            return SceneControl;
        }

        _.forIn(displays, function(val, key) {
            if (obj instanceof val) {
                name = /(\w+)(Display|Effect)/.exec(key);
                control = ControlLibrary[name[1] + 'Control'];
                return false;
            }
        }, this);

        return control;
    }
};

module.exports = ControlLoader;

