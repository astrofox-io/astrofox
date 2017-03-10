import React from 'react';

import UIComponent from '../UIComponent';
import Button from '../components/Button';
import ColorInput from '../inputs/ColorInput';
import SelectInput from '../inputs/SelectInput';
import { SettingsPanel, Settings, Row } from '../layout/SettingsPanel';

const canvasSizes = {
    '16:9': { width: 854, height: 480 },
    '3:2': { width: 720, height: 480 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 480, height: 480 }
};

export default class CanvasSettings extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
        this.state = this.app.stage.options;
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
        this.app.stage.update(this.state);

        this.props.onClose();
    }

    render() {
        const state = this.state,
            props = this.props;

        return (
            <SettingsPanel width={props.width} height={props.height}>
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
            </SettingsPanel>
        );
    }
}

CanvasSettings.contextTypes = {
    app: React.PropTypes.object
};