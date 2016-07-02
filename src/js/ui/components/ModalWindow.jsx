'use strict';

const React = require('react');
const Application = require('../../core/Application.js');

const ModalWindow = (props) => {
    let buttons = null;

    if (props.buttons) {
        buttons = props.buttons.map((button) => {
            return (
                <div className="button" onClick={button.click}>
                    {button.text}
                </div>
            );
        });
    }

    return (
        <div className="modal-window">
            <div className="header">
                {props.title}
                <i className="close-button icon-cross" onClick={props.onClose} />
            </div>
            <div className="body">
                {props.children}
            </div>
            <div className="buttons">
                {buttons}
            </div>
        </div>
    );
};

module.exports = ModalWindow;