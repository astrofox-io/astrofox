import React from 'react';

import Button from './Button';

const ModalWindow = (props) => {
    let buttons = null;

    let closeButton = (props.showCloseButton !== false) ?
            <span className="close-button icon-cross" onClick={props.onClose} /> : null;

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

    return (
        <div className="modal">
            <div className="modal-window">
                {closeButton}
                <div className="header">
                    {props.title}
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

export default ModalWindow;