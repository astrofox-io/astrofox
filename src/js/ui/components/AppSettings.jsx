import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';

import ListInput from '../inputs/ListInput.jsx';
import ToggleInput from '../inputs/ToggleInput.jsx';
import TabPanel from '../layout/TabPanel.jsx';
import Tab from '../layout/Tab.jsx';
import { Settings, Group, Row } from '../components/Settings.jsx';

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
        Application.saveConfig(this.state, () => {
            this.props.onClose();
        });
    }

    onCancel() {
        this.props.onClose();
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
                    <div className="button" onClick={this.onSave}>Save</div>
                    <div className="button" onClick={this.onCancel}>Cancel</div>
                </div>
            </div>
        );
    }
}

AppSettings.defaultProps = {
    onClose: () => {}
};