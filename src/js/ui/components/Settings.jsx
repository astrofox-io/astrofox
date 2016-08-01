'use strict';

const React = require('react');
const classNames = require('classnames');
const Application = require('../../core/Application.js');
const { Events } = require('../../core/Global.js');
const autoBind = require('../../util/autoBind.js');

const ListInput = require('../inputs/ListInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput');
const TabPanel = require('../layout/TabPanel.jsx');
const Tab = require('../layout/Tab.jsx');

const canvasSizes = {
    '16:9': { width: 854, height: 480 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 480, height: 480 }
};

class Settings extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Application.config;
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        this.setState(obj);
    }

    onSave() {
        Application.saveConfig(this.state, () => {
            Events.emit('canvas_size_update', canvasSizes[this.state.canvasSize]);

            this.props.onClose();
        });
    }

    onCancel() {
        this.props.onClose();
    }

    render() {
        const state = this.state;

        return (
            <div className="settings-panel">
                <TabPanel tabPosition="left" className="flex">
                    <Tab name="Project">
                        <fieldset>
                            <div className="input-row">
                                <label>Canvas Size</label>
                                <CanvasSizeInput name="canvasSize" value={state.canvasSize} onChange={this.onChange} />
                            </div>
                        </fieldset>
                    </Tab>

                    <Tab name="General">
                        <fieldset>
                            <div className="input-row">
                                <label>Automatically check for updates</label>
                                <ToggleInput name="checkForUpdates" value={state.checkForUpdates} onChange={this.onChange} />
                            </div>
                            <div className="input-row">
                                <label>Automatically download and install updates</label>
                                <ToggleInput name="downloadUpdates" value={state.downloadUpdates} onChange={this.onChange} />
                            </div>
                            <div className="input-row">
                                <label>Show FPS</label>
                                <ToggleInput name="showFPS" value={state.showFPS} onChange={this.onChange} />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Fonts</legend>
                            <div className="input-row">
                                <label>System Fonts</label>
                                <ListInput name="systemFonts" options={state.systemFonts} onChange={this.onChange} />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Video</legend>
                            <div className="input-row">
                                <label>FFmpeg location</label>
                                <TextInput name="ffmpegPath" size="40" value={state.ffmpegPath} onChange={this.onChange} />
                            </div>
                        </fieldset>
                    </Tab>

                    <Tab name="Advanced">
                        <fieldset>
                            <div className="input-row">
                                <label>Send usage statistics</label>
                                <ToggleInput name="sendUsageStats" value={state.sendUsageStats} onChange={this.onChange} />
                            </div>
                            <div className="input-row">
                                <label>Send crash reports</label>
                                <ToggleInput name="sendCrashReports" value={state.sendCrashReports} onChange={this.onChange} />
                            </div>
                        </fieldset>
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
    onClose: () => {}
};

const CanvasSizeInput = (props) => {
    let options = Object.keys(canvasSizes).map((key, index) => {
        let { width, height } = canvasSizes[key],
            ratio = 60 / height;

        return (
            <div
                key={index}
                className={classNames('canvas-option', {'canvas-option-selected': (props.value === key)})}
                style={{width: width * ratio, height: height * ratio}}
                onClick={() => props.onChange(props.name, key)}>
                {key}
            </div>
        );
    });

    return (
        <div className="flex">
            {options}
        </div>
    );
};

module.exports = Settings;