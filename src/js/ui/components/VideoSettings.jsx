import React from 'react';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';

import Button from '../components/Button';
import ButtonInput from '../inputs/ButtonInput';
import NumberInput from '../inputs/NumberInput';
import TimeInput from '../inputs/TimeInput';
import SelectInput from '../inputs/SelectInput';
import TextInput from '../inputs/TextInput';
import { SettingsPanel, Settings, Row } from '../layout/SettingsPanel';
import { replaceExt } from '../../util/file';
import { formatTime } from '../../util/format';

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
    constructor(props, context) {
        super(props);

        this.state = {
            videoFile: '',
            audioFile: '',
            format: 'mp4',
            resolution: 480,
            fps: 30,
            timeStart: 0,
            timeEnd: 0
        };
        
        this.app = context.app;
    }

    componentDidMount() {
        let audio = this.app.getAudio();

        this.app.stopAudio();

        if (audio) {
            this.setState({
                audioFile: this.app.audioFile,
                timeEnd: audio.getDuration()
            });
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
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    onStart() {
        if (this.props.onStart) {
            this.props.onStart(this.state);
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
        let path = this.app.audioFile;

        Window.showOpenDialog(
            files => {
                if (files) {
                    this.app.loadAudioFile(files[0]).then(() => {
                        let audio = this.app.getAudio();

                        this.setState({
                            audioFile: this.app.audioFile,
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
        const props = this.props,
            state = this.state,
            audio = this.app.getAudio(),
            max = (audio) ? audio.getDuration() : 0,
            canStart = (state.videoFile && state.audioFile);

        return (
            <SettingsPanel width={props.width} height={props.height}>
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
                        <ButtonInput
                            icon="icon-folder-open-empty"
                            onClick={this.onOpenVideoFile}
                        />
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
                        <ButtonInput
                            icon="icon-folder-open-empty"
                            onClick={this.onOpenAudioFile}
                        />
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
                    <Row label="Total Time">
                        {formatTime(state.timeEnd - state.timeStart)}
                    </Row>
                </Settings>
                <div className="buttons">
                    <Button text="Start" onClick={this.onStart} disabled={!canStart} />
                    <Button text="Cancel" onClick={this.onCancel} />
                </div>
            </SettingsPanel>
        );
    }
}

VideoSettings.contextTypes = {
    app: React.PropTypes.object
};