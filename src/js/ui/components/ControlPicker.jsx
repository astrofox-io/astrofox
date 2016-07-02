'use strict';

const _ = require('lodash');
const React = require('react');
const Application = require('../../core/Application.js');

const ControlPicker = function(props) {
    let controls = _.values(props.items).map(function(item, index){
        let handleClick = function() {
            let obj = new item();

            props.scene.addElement(obj);

            Application.emit('control_added', obj);
        };

        return (
            <div key={index} className="item">
                <div className="image" onClick={handleClick}></div>
                <div className="name">{item.info.name}</div>
            </div>
        );
    }.bind(this));

    return (
        <div className="control-picker">
            {controls}
        </div>
    );
};

module.exports = ControlPicker;