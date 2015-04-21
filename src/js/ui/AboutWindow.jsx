'use strict';

var React = require('react');

var AboutPanel = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.onOkClick();
    },

    render: function() {
        return (
            <div className="modal-window">
                <div className="header">ABOUT</div>
                <div className="body">
                    AstroFox version 1.0
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClick}>OK</div>
                </div>
            </div>
        );
    }
});

module.exports = AboutPanel;