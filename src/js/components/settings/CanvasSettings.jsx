import React from 'react';
import propTypes from 'prop-types';

import UIComponent from 'components/UIComponent';
import Button from 'components/interface/Button';
import ColorInput from 'components/inputs/ColorInput';
import NumberInput from 'components/inputs/NumberInput';
import { SettingsPanel, Settings, Row } from 'components/layout/SettingsPanel';

export default class CanvasSettings extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
        this.state = this.app.stage.options;
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

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
                    <Row label="Width">
                        <NumberInput
                            name="width"
                            width={40}
                            min={240}
                            max={1920}
                            step={2}
                            value={state.width}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Height">
                        <NumberInput
                            name="height"
                            width={40}
                            min={240}
                            max={1080}
                            step={2}
                            value={state.height}
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
    app: propTypes.object
};