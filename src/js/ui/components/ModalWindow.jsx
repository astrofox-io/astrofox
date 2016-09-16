'use strict';

const React = require('react');

const ModalWindow = (props) => {
    let buttons = null;

    let closeButton = (props.showCloseButton !== false) ?
            <span className="close-button icon-cross" onClick={props.onClose} /> : null;

    if (props.buttons) {
        buttons = props.buttons.map((button, index) => {
            return (
                <div key={index} className="button" onClick={props.onClose.bind(null, index)}>
                    {button}
                </div>
            );
        });
    }

    return (
        <div className="modal">
            <div className="background" />
            <div className="modal-window">
                <div className="header">
                    {props.title}
                    {closeButton}
                </div>
                <div className="body">
                    {props.children}
                </div>
                <div className="buttons">
                    {buttons}
                </div>
            </div>
        </div>
    );
};

module.exports = ModalWindow;