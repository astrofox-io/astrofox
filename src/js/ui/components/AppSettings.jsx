'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const { Events } = require('../../core/Global');
const ListInput = require('../inputs/ListInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput');
const TabPanel = require('../layout/TabPanel.jsx');
const Tab = require('../layout/Tab.jsx');
const { Settings, Group, Row } = require('../components/Settings.jsx');

class AppSettings extends UIComponent {
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
                                <Row label="Autoplay audio">
                                    <ToggleInput
                                        name="autoPlay"
                                        value={state.autoPlay}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            </Group>

                            <Group name="Fonts">
                                <Row label="System fonts">
                                    <ListInput
                                        name="systemFonts"
                                        options={state.systemFonts}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            </Group>

                            <Group name="Video">
                                <Row label="FFmpeg location">
                                    <TextInput
                                        className="flex"
                                        name="ffmpegPath"
                                        width="100%"
                                        value={state.ffmpegPath}
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
                            <Row label="Automatically download and install updates">
                                <ToggleInput
                                    name="downloadUpdates"
                                    value={state.downloadUpdates}
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

module.exports = AppSettings;