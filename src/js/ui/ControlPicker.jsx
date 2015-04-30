'use strict';

var React = require('react');
var ModalWindow = require('../ui/ModalWindow.jsx');
var FX = require('../FX.js');

var ControlPicker = React.createClass({
    getDefaultProps: function() {
        return {
            onClose: function(){}
        };
    },

    handleControlAdd: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.onClose();
    },

    componentWillMount: function() {
        this.app = this.props.app;
    },

    render: function() {
        var controls = [
            FX.TextDisplay,
            FX.ImageDisplay,
            FX.BarSpectrumDisplay
        ].map(function(item, index){
            var handleClick = function() {
                this.props.app.addDisplay(new item);
                this.props.onClose();
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

module.exports = ControlPicker;