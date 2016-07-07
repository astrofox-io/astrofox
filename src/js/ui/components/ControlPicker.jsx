'use strict';

const _ = require('lodash');
const React = require('react');

const { Events } = require('../../core/Global.js');

const ControlPicker = (props) => {
    let controls = _.values(props.items).map((item, index) => {
        let onClick = () => {
            let obj = new item();

            props.scene.addElement(obj);

            Events.emit('control_added', obj);
        };

        return (
            <div key={index} className="item">
                <div className="image" onClick={onClick}></div>
                <div className="name">{item.info.name}</div>
            </div>
        );
    });

    return (
        <div className="control-picker">
            {controls}
        </div>
    );
};

module.exports = ControlPicker;