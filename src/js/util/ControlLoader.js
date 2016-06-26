'use strict';

const _ = require('lodash');
const DisplayLibrary = require('../lib/DisplayLibrary.js');
const EffectsLibrary = require('../lib/EffectsLibrary.js');
const ControlLibrary = require('../lib/ControlLibrary.js');
const Scene = require('../display/Scene.js');
const SceneControl = require('../ui/controls/SceneControl.jsx');
const EmptyControl = require('../ui/controls/EmptyControl.jsx');

class ControlLoader {
    static getControl(obj) {
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

        if (!control) control = EmptyControl;

        return control;
    }
}

module.exports = ControlLoader;

