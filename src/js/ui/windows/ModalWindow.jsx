'use strict';

var React = require('react');
var Application = require('core/Application.js');

var ModalWindow = React.createClass({
    getDefaultProps: function() {
        return {
            title: '',
            onClose: function(){}
        };
    },

    handleClose: function(e) {
        e.preventDefault();
        e.stopPropagation();

        Application.emit('hide_modal');
    },

    render: function() {
        return (
            <div className="modal-window">
                <div className="header">
                    {this.props.title}
                    <i className="close-button icon-cross" onClick={this.handleClose} />
                </div>
                <div className="body">
                    {this.props.children}
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClose}>OK</div>
                </div>
            </div>
        );
    }
});

module.exports = ModalWindow;