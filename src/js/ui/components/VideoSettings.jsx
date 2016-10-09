'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const Window = require('../../core/Window');

const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const DualRangeInput = require('../inputs/DualRangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const Button = require('../inputs/Button.jsx');
const { Settings, Group, Row } = require('../components/Settings.jsx');

const { formatTime } = require('../../util/format');

const videoFormats = [
    'mp4',
    'webm'
];

const resolutionOptions = [
    480,
    720,
    1080
];

const fpsOptions = [
    29.97,
    60
];

class VideoSettings extends UIComponent {
    constructor(props) {
        super(props);

        this.state = Object.assign(
            { isRunning: false },
            VideoSettings.defaultProps,
            props
        );
    }

    componentDidMount() {
        let player = Application.player,
            sound = player.getSound('audio');

        player.stop('audio');

        if (sound) {
            this.setState({ timeEnd: sound.getDuration() });
        }
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        if (name === 'timeRange') {
            obj.timeStart = val.start;
            obj.timeEnd = val.end;
        }

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    onStart() {
        if (!this.state.isRunning) {
            this.setState({ isRunning: true });

            Application.saveVideo(this.state.videoFile, this.state, () => {
                this.setState({ isRunning: false });
            });
        }
    }

    onOpenVideoFile() {
        Window.showSaveDialog(
            filename => {
                if (filename) {
                    this.setState({ videoFile: filename });
                }
            },
            { defaultPath: 'video.mp4' }
        );
    }

    onOpenAudioFile() {
        let path = Application.audioFile;

        Window.showOpenDialog(
            files => {
                if (files) {
                    Application.loadAudioFile(files[0]).then(() => {
                        let sound = Application.player.getSound('audio');

                        this.setState({
                            audioFile: Application.audioFile,
                            timeStart: 0,
                            timeEnd: sound.getDuration()
                        });
                    });
                }
            },
            { defaultPath: path }
        );
    }

    render() {
        const state = this.state,
            sound = Application.player.getSound('audio'),
            max = (sound) ? sound.getDuration() : 0,
            canStart = (state.videoFile && state.audioFile),
            onStart = canStart ? this.onStart: null;

        const buttonClass = {
            button: true,
            disabled: !canStart
        };

        return (
            <div id="video-settings" className="settings-panel">
                <Settings>
                    <Row label="Video File">
                        <TextInput
                            className="flex"
                            inputClassName="normal-text"
                            name="videoFile"
                            width="100%"
                            value={state.videoFile}
                            readOnly={true}
                            onChange={this.onChange}
                        />
                        <Button icon="icon-folder-open-empty" onClick={this.onOpenVideoFile} />
                    </Row>
                    <Row label="Audio File">
                        <TextInput
                            className="flex"
                            inputClassName="normal-text"
                            name="audioFile"
                            width="100%"
                            value={state.audioFile}
                            readOnly={true}
                            onChange={this.onChange}
                        />
                        <Button icon="icon-folder-open-empty" onClick={this.onOpenAudioFile} />
                    </Row>
                    <Row label="Video Format">
                        <SelectInput
                            name="videoFormat"
                            width={80}
                            items={videoFormats}
                            value={state.videoFormat}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Video Resolution">
                        <SelectInput
                            name="resolution"
                            width={80}
                            items={resolutionOptions}
                            value={state.resolution}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="FPS">
                        <SelectInput
                            name="fps"
                            width={80}
                            items={fpsOptions}
                            value={state.fps}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Time Range">
                        <NumberInput
                            name="timeStart"
                            width={60}
                            min={0}
                            max={max}
                            step={0.025}
                            value={state.timeStart}
                            onChange={this.onChange}
                        />
                        <div className="input flex">
                            <DualRangeInput
                                name="timeRange"
                                min={0}
                                max={max}
                                step={0.025}
                                start={state.timeStart}
                                end={state.timeEnd}
                                minRange={1}
                                onChange={this.onChange}
                            />
                        </div>
                        <NumberInput
                            name="timeEnd"
                            width={60}
                            min={0}
                            max={max}
                            step={0.025}
                            value={state.timeEnd}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label=" ">
                        {formatTime(state.timeStart, true, true)} - {formatTime(state.timeEnd, true, true)}
                    </Row>
                </Settings>
                <div className="buttons">
                    <div className={classNames(buttonClass)} onClick={onStart}>Start</div>
                    <div className="button" onClick={this.onCancel}>Cancel</div>
                </div>
            </div>
        );
    }
}

VideoSettings.defaultProps = {
    videoFile: '',
    audioFile: '',
    videoFormat: 'mp4',
    resolution: 480,
    fps: 29.97,
    timeStart: 0,
    timeEnd: 0
};

module.exports = VideoSettings;