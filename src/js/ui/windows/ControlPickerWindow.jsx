'use strict';

var React = require('react');
var _ = require('lodash');
var Application = require('../../core/Application.js');
var FX = require('../../FX.js');

var ModalWindow = require('./ModalWindow.jsx');

var ControlPickerWindow = React.createClass({
    render: function() {
        var controls = _.values(FX).map(function(fx, index){
            var handleClick = function() {
                var display = new fx();

                this.props.scene.addDisplay(display);

                Application.emit('control_added', display);

                if (this.props.onClose) {
                    this.props.onClose();
                }
            }.bind(this);

            return (
                <div key={"c" + index}>
                    <div className="item" onClick={handleClick}></div>
                    <div className="name">{fx.info.name}</div>
                </div>
            );
        }.bind(this));

        return (
            <ModalWindow title="ADD DISPLAY" onClose={this.props.onClose}>
                <div className="control-picker">
                    {controls}
                </div>
            </ModalWindow>
        );
    }
});

module.exports = ControlPickerWindow;