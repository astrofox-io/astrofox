'use strict';

const DisplayLibrary = require('../lib/DisplayLibrary.js');
const EffectsLibrary = require('../lib/EffectsLibrary.js');
const ControlLibrary = require('../lib/ControlLibrary.js');
const Scene = require('../display/Scene.js');
const SceneControl = require('../ui/controls/SceneControl.jsx');
const EmptyControl = require('../ui/controls/EmptyControl.jsx');

const displays = Object.assign({}, DisplayLibrary, EffectsLibrary);

module.exports = (obj) => {
    if (obj instanceof Scene) {
        return SceneControl;
    }

    for (let key in displays) {
        if (obj instanceof displays[key]) {
            let name = /(\w+)(Display|Effect)/.exec(key);
            return ControlLibrary[name[1] + 'Control'];
        }
    }

    return EmptyControl;
};