'use strict';

const React = require('react');

const ColorPicker = function(props) {
    return (
        <div>
            <canvas ref="canvas" />
        </div>
    );
};

module.exports = ColorPicker;