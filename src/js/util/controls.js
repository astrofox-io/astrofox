'use strict';

const DisplayLibrary = require('../lib/DisplayLibrary');
const EffectsLibrary = require('../lib/EffectsLibrary');
const ControlLibrary = require('../lib/ControlLibrary');

const SceneControl = require('../ui/controls/SceneControl.jsx');
const EmptyControl = require('../ui/controls/EmptyControl.jsx');

const displays = Object.assign({}, DisplayLibrary, EffectsLibrary);

function getControlComponent(obj) {
    if (obj.constructor.className === 'Scene') {
        return SceneControl;
    }

    for (let key in displays) {
        if (displays.hasOwnProperty(key) && obj instanceof displays[key]) {
            let name = /(\w+)(Display|Effect)/.exec(key);
            return ControlLibrary[name[1] + 'Control'];
        }
    }

    return EmptyControl;
}

module.exports = {
    getControlComponent
};