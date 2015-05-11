'use strict';

var React = require('react');
var _ = require('lodash');
var Application = require('../../Application.js');
var FX = require('../../FX.js');

var ModalWindow = require('./ModalWindow.jsx');

var ControlPickerWindow = React.createClass({
    handleControlClick: function(e) {
        e.stopPropagation();

        this.props.onClose();
    },

    render: function() {
        var controls = _.values(FX).map(function(item, index){
            var handleClick = function() {
                Application.addDisplay(new item, 0);
                Application.emit('displays_updated');

                if (this.props.onClose) {
                    this.props.onClose();
                }
            }.bind(this);

            return (
                <div key={"c" + index}>
                    <div className="item" onClick={handleClick}></div>
                    <div className="name">{item.info.name}</div>
                </div>
            );
        }.bind(this));

        return (
            <ModalWindow title="ADD CONTROL" onClose={this.props.onClose}>
                <div className="control-picker">
                    {controls}
                </div>
            </ModalWindow>
        );
    }
});

module.exports = ControlPickerWindow;