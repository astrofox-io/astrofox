'use strict';

const React = require('react');
const Application = require('../../core/Application.js');

class ModalWindow extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClose(e) {
        e.preventDefault();
        e.stopPropagation();

        Application.emit('hide_modal');

        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        return (
            <div className="modal-window">
                <div className="header">
                    {this.props.title}
                    <i className="close-button icon-cross" onClick={this.handleClose.bind(this)} />
                </div>
                <div className="body">
                    {this.props.children}
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClose.bind(this)}>OK</div>
                </div>
            </div>
        );
    }
}

module.exports = ModalWindow;