import React from 'react';
import propTypes from 'prop-types';

import UIComponent from 'components/UIComponent';
import Button from 'components/interface/Button';
import ToggleInput from 'components/inputs/ToggleInput';
import { SettingsPanel, Settings, Group, Row } from 'components/layout/SettingsPanel';

export default class AppSettings extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
        this.state = Object.assign({}, this.app.config);
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        this.setState(obj);
    }

    onSave() {
        this.app.saveConfigFile(this.state)
            .then(() => {
                if (this.props.onClose) {
                    this.props.onClose();
                }
            });
    }

    onCancel() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        const props = this.props,
            state = this.state;

        return (
            <SettingsPanel width={props.width} height={props.height}>
                <Settings>
                    <Group name="General">
                        <Row label="Check for updates on start up">
                            <ToggleInput
                                name="checkForUpdates"
                                value={state.checkForUpdates}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Automatically download and install updates">
                            <ToggleInput
                                name="autoUpdate"
                                value={state.autoUpdate}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Show watermark" description="Watermark will still appear in videos">
                            <ToggleInput
                                name="showWatermark"
                                value={state.showWatermark}
                                onChange={this.onChange}
                            />
                        </Row>
                    </Group>
                    <Group name="Audio">
                        <Row label="Play audio on load">
                            <ToggleInput
                                name="autoPlayAudio"
                                value={state.autoPlayAudio}
                                onChange={this.onChange}
                            />
                        </Row>
                    </Group>
                </Settings>
                <div className="buttons">
                    <Button onClick={this.onSave} text="Save" />
                    <Button onClick={this.onCancel} text="Cancel" />
                </div>
            </SettingsPanel>
        );
    }
}

AppSettings.contextTypes = {
    app: propTypes.object
};