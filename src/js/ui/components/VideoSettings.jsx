import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';
import Window from '../../core/Window';

import NumberInput from '../inputs/NumberInput';
import TimeInput from '../inputs/TimeInput';
import SelectInput from '../inputs/SelectInput';
import TextInput from '../inputs/TextInput';
import Button from './Button';
import { Settings, Row } from '../components/Settings';

import { formatTime } from '../../util/format';
import { replaceExt } from '../../util/file';

const videoFormats = [
    'mp4',
    'webm'
];

const resolutionOptions = [
    480,
    720,
    1080
];

export default class VideoSettings extends UIComponent {
    constructor(props) {
        super(props);

        this.state = Object.assign(
            { isRunning: false },
            VideoSettings.defaultProps,
            props
        );
    }

    componentDidMount() {
        let audio = Application.getAudio();

        Application.stopAudio();

        if (audio) {
            this.setState({ timeEnd: audio.getDuration() });
        }
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        if (name === 'format' && this.state.videoFile) {
            obj.videoFile = replaceExt(this.state.videoFile, '.' + val);
        }

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    onStart() {
        if (!this.state.isRunning) {
            this.setState({isRunning: true});

            Application.saveVideo(this.state.videoFile, this.state, () => {
                this.setState({isRunning: false});
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
            { defaultPath: 'video.' + this.state.format }
        );
    }

    onOpenAudioFile() {
        let path = Application.audioFile;

        Window.showOpenDialog(
            files => {
                if (files) {
                    Application.loadAudioFile(files[0]).then(() => {
                        let audio = Application.getAudio();

                        this.setState({
                            audioFile: Application.audioFile,
                            timeStart: 0,
                            timeEnd: audio.getDuration()
                        });
                    });
                }
            },
            { defaultPath: path }
        );
    }

    render() {
        const state = this.state,
            audio = Application.getAudio(),
            max = (audio) ? audio.getDuration() : 0,
            canStart = (state.videoFile && state.audioFile),
            onStart = canStart ? this.onStart: null;

        const buttonClass = {
            button: true,
            disabled: !canStart
        };

        return (
            <div id="video-settings" className="settings-panel">
                <Settings>
                    <Row label="Save Video To">
                        <TextInput
                            className="flex"
                            inputClassName="input-normal-text"
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
                            inputClassName="input-normal-text"
                            name="audioFile"
                            width="100%"
                            value={state.audioFile}
                            readOnly={true}
                            onChange={this.onChange}
                        />
                        <Button icon="icon-folder-open-empty" onClick={this.onOpenAudioFile} />
                    </Row>
                    <Row label="Format">
                        <SelectInput
                            name="format"
                            width={80}
                            items={videoFormats}
                            value={state.format}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Video Resolution" className="display-none">
                        <SelectInput
                            name="resolution"
                            width={80}
                            items={resolutionOptions}
                            value={state.resolution}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="FPS">
                        <NumberInput
                            name="fps"
                            width={60}
                            min={24}
                            max={60}
                            step={1}
                            value={state.fps}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Start Time">
                        <TimeInput
                            name="timeStart"
                            width={80}
                            min={0}
                            max={state.timeEnd}
                            value={state.timeStart}
                            readOnly={!audio}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="End Time">
                        <TimeInput
                            name="timeEnd"
                            width={80}
                            min={0}
                            max={max}
                            value={state.timeEnd}
                            readOnly={!audio}
                            onChange={this.onChange}
                        />
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
    format: 'mp4',
    resolution: 480,
    fps: 30,
    timeStart: 0,
    timeEnd: 0
};