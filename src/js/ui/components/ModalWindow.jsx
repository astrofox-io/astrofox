'use strict';

const React = require('react');

const ModalWindow = (props) => {
    let buttons = null;

    if (props.buttons) {
        buttons = props.buttons.map((button, index) => {
            return (
                <div key={index} className="button" onClick={button.click}>
                    {button.text}
                </div>
            );
        });
    }

    return (
        <div className="overlay">
            <div className="background" />
            <div className="modal-window">
                <div className="header">
                    {props.title}
                    <span className="close-button icon-cross" onClick={props.onClose} />
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