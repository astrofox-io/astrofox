import React from 'react';

import { events } from '../../core/Global';

const ControlPicker = (props) => {
    let values = Object.keys(props.items).map(key => props.items[key]);

    let controls = values.map((item, index) => {
        let onClick = () => {
            let obj = new item();

            props.scene.addElement(obj);

            events.emit('layers-update', obj);

            props.onClose();
        };

        return (
            <div key={index} className="item">
                <div className="image" onClick={onClick}></div>
                <div className="name">{item.label}</div>
            </div>
        );
    });

    return (
        <div className="control-picker">
            {controls}
        </div>
    );
};

export default ControlPicker;