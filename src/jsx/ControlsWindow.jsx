'use strict';

var React = require('react');

var ControlsWindow = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.onConfirm();
    },

    render: function() {
        return (
            <div className="modal-window">
                <div className="header">{this.props.title}</div>
                <div className="content">
                    <table>
                        <tr>
                            <td>Text</td>
                            <td>Display text with different fonts and colors.</td>
                        </tr>
                        <tr>
                            <td>Image</td>
                            <td>Insert an image.</td>
                        </tr>
                        <tr>
                            <td>Bar Spectrum</td>
                            <td>Display the audio spectrum as bars.</td>
                        </tr>
                    </table>
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClick}>OK</div>
                </div>
            </div>
        );
    }
});

module.exports = ControlsWindow;