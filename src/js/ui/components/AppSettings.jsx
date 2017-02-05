import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';

import Button from '../components/Button';
import ListInput from '../inputs/ListInput';
import ToggleInput from '../inputs/ToggleInput';
import TabPanel from '../layout/TabPanel';
import Tab from '../layout/Tab';
import { Settings, Group, Row } from '../components/Settings';

export default class AppSettings extends UIComponent {
    constructor(props) {
        super(props);

        this.state = Object.assign({}, Application.config);
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        this.setState(obj);
    }

    onSave() {
        Application.saveConfigFile(this.state, () => {
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
        const state = this.state;

        return (
            <div id="app-settings" className="settings-panel">
                <TabPanel tabPosition="left">
                    <Tab name="General">
                        <Settings>
                            <Group name="Interface">
                                <Row label="Show FPS">
                                    <ToggleInput
                                        name="showFPS"
                                        value={state.showFPS}
                                        onChange={this.onChange}
                                    />
                                </Row>
                                <Row label="Show watermark">
                                    <ToggleInput
                                        name="showWatermark"
                                        value={state.showWatermark}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            </Group>

                            <Group name="Audio">
                                <Row label="Autoplay audio">
                                    <ToggleInput
                                        name="autoPlay"
                                        value={state.autoPlay}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            </Group>

                            <Group name="Fonts" className="display-none">
                                <Row label="System fonts">
                                    <ListInput
                                        name="systemFonts"
                                        options={state.systemFonts}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            </Group>
                        </Settings>
                    </Tab>

                    <Tab name="Advanced">
                        <Settings>
                            <Row label="Automatically check for updates">
                                <ToggleInput
                                    name="checkForUpdates"
                                    value={state.checkForUpdates}
                                    onChange={this.onChange}
                                />
                            </Row>
                            <Row label="Send usage statistics">
                                <ToggleInput
                                    name="sendUsageStats"
                                    value={state.sendUsageStats}
                                    onChange={this.onChange}
                                />
                            </Row>
                            <Row label="Send crash reports">
                                <ToggleInput
                                    name="sendCrashReports"
                                    value={state.sendCrashReports}
                                    onChange={this.onChange}
                                />
                            </Row>
                        </Settings>
                    </Tab>
                </TabPanel>
                <div className="buttons">
                    <Button onClick={this.onSave} text="Save" />
                    <Button onClick={this.onCancel} text="Cancel" />
                </div>
            </div>
        );
    }
}

AppSettings.defaultProps = {
    onClose: null
};