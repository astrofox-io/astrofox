'use strict';

const React = require('react');
const ModalWindow = require('./ModalWindow.jsx');

const AboutWindow = function(props) {
    return (
        <ModalWindow title="ABOUT" onClose={props.onClose}>
            AstroFox version 1.0
        </ModalWindow>
    );
};

module.exports = AboutWindow;