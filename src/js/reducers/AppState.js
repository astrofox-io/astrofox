'use strict';

const Redux = require('redux');
const Interface = require('./Interface.js');
const Settings = require('./Settings.js');

module.exports = Redux.combineReducers({
    interface: Interface,
    settings: Settings
});