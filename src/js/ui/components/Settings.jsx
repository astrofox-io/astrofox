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

class Settings extends UIComponent {
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

        const style = {
            width: this.props.width,
            height: this.props.height
        };

        return (
            <div className="settings-panel" style={style}>
                <TabPanel tabPosition="left">
                    <Tab name="General" className="view">
                        <div className="group">
                            <div className="header">Interface</div>
                            <div className="row">
                                <span className="label">Show FPS</span>
                                <ToggleInput name="showFPS" value={state.showFPS} onChange={this.onChange} />
                            </div>
                            <div className="row">
                                <span className="label">Autoplay audio</span>
                                <ToggleInput name="autoPlay" value={state.autoPlay} onChange={this.onChange} />
                            </div>
                        </div>

                        <div className="group">
                            <div className="header">Fonts</div>
                            <div className="row">
                                <span className="label">System fonts</span>
                                <ListInput name="systemFonts" options={state.systemFonts} onChange={this.onChange} />
                            </div>
                        </div>

                        <div className="group">
                            <div className="header">Video</div>
                            <div className="row">
                                <span className="label">FFmpeg location</span>
                                <TextInput name="ffmpegPath" size={40} value={state.ffmpegPath} onChange={this.onChange} />
                            </div>
                        </div>
                    </Tab>

                    <Tab name="Advanced" className="view">
                        <div className="group">
                            <div className="row">
                                <span className="label">Automatically check for updates</span>
                                <ToggleInput name="checkForUpdates" value={state.checkForUpdates} onChange={this.onChange} />
                            </div>
                            <div className="row">
                                <span className="label">Automatically download and install updates</span>
                                <ToggleInput name="downloadUpdates" value={state.downloadUpdates} onChange={this.onChange} />
                            </div>
                            <div className="row">
                                <span className="label">Send usage statistics</span>
                                <ToggleInput name="sendUsageStats" value={state.sendUsageStats} onChange={this.onChange} />
                            </div>
                            <div className="row">
                                <span className="label">Send crash reports</span>
                                <ToggleInput name="sendCrashReports" value={state.sendCrashReports} onChange={this.onChange} />
                            </div>
                        </div>
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

Settings.defaultProps = {
    width: 720,
    height: 400,
    onClose: () => {}
};

module.exports = Settings;