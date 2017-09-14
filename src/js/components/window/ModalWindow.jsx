import React from 'react';

import Button from 'components/interface/Button';

const ModalWindow = (props) => {
    let title, buttons, closeButton;

    if (props.title) {
        title = (
            <div className="header">
                {props.title}
            </div>
        );
    }

    if (props.buttons) {
        buttons = props.buttons.map((text, index) => {
            return (
                <Button
                    key={index}
                    text={text}
                    onClick={props.onClose.bind(null, text)}
                />
            );
        });
    }

    if (props.showCloseButton !== false) {
        closeButton = (
            <span
                className="close-button icon-cross"
                onClick={props.onClose}
            />
        );
    }

    return (
        <div className="modal">
            <div className="modal-window">
                {closeButton}
                {title}
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

export default ModalWindow;