'use strict';

const _ = require('lodash');
const React = require('react');
const Application = require('../../core/Application.js');
const Display = require('../../display/Display.js');

const ModalWindow = require('./ModalWindow.jsx');

const ControlPickerWindow = function(props) {
    let controls = _.values(props.items).map(function(item, index){
        let handleClick = function() {
            let obj = new item();

            props.scene.addElement(obj);

            Application.emit('control_added', obj);
            Application.emit('hide_modal');
        };

        return (
            <div key={"c" + index} className="item">
                <div className="image" onClick={handleClick}></div>
                <div className="name">{item.info.name}</div>
            </div>
        );
    }.bind(this));

    return (
        <ModalWindow title={props.title}>
            <div className="control-picker">
                {controls}
            </div>
        </ModalWindow>
    );
};

module.exports = ControlPickerWindow;