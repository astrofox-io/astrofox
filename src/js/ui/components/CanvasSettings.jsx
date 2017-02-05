import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';
import Button from '../components/Button';
import ColorInput from '../inputs/ColorInput';
import SelectInput from '../inputs/SelectInput';
import { Settings, Row } from '../components/Settings';

const canvasSizes = {
    '16:9': { width: 854, height: 480 },
    '3:2': { width: 720, height: 480 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 480, height: 480 }
};

export default class CanvasSettings extends UIComponent {
    constructor(props) {
        super(props);

        this.state = Application.stage.options;
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        if (name === 'aspectRatio') {
            Object.assign(obj, canvasSizes[val]);
        }

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    onSave() {
        Application.stage.update(this.state);

        this.props.onClose();
    }

    render() {
        const state = this.state;

        return (
            <div id="canvas-settings" className="settings-panel">
                <Settings>
                    <Row label="Aspect Ratio">
                        <SelectInput
                            name="aspectRatio"
                            width={140}
                            items={Object.keys(canvasSizes)}
                            value={state.aspectRatio}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Background Color">
                        <ColorInput
                            name="backgroundColor"
                            value={state.backgroundColor}
                            onChange={this.onChange}
                        />
                    </Row>
                </Settings>
                <div className="buttons">
                    <Button onClick={this.onSave} text="OK" />
                    <Button onClick={this.onCancel} text="Cancel" />
                </div>
            </div>
        );
    }
}