'use strict';

var React = require('react');

var AstroFox = {};

AstroFox.Application = require('./Application.js');
AstroFox.FX = require('./FX.js');
AstroFox.UI = require('./UI.js');
AstroFox.Client = require('../jsx/App.jsx');

AstroFox.version = '1.0';

AstroFox.start = function(){
    React.render(
        React.createElement(AstroFox.Client, null),
        document.getElementById("app")
    );
};

module.exports = AstroFox;