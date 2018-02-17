import React from 'react';
import PropTypes from 'prop-types';
import Window from 'core/Window';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Row, ButtonRow } from 'components/layout/SettingsPanel';
import {
    ButtonInput,
    NumberInput,
    TimeInput,
    SelectInput,
    TextInput,
} from 'lib/inputs';
import { replaceExt } from 'utils/file';
import { formatTime } from 'utils/format';
import folderIcon from 'svg/icons/folder-open-empty.svg';
import styles from './VideoSettings.less';

const videoFormats = [
    'mp4',
    'webm',
];

const resolutionOptions = [
    480,
    720,
    1080,
];

export default class VideoSettings extends React.Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    static defaultProps = {
        onStart: () => {},
        onClose: () => {},
    }

    constructor(props, context) {
        super(props);

        const audio = this.app.player.getAudio();

        this.app = context.app;
        this.state = {
            videoFile: '',
            audioFile: audio ? this.app.audioFile : '',
            format: 'mp4',
            resolution: 480,
            fps: 30,
            timeStart: 0,
            timeEnd: audio ? audio.getDuration() : 0,
        };
    }

    componentDidMount() {
        this.app.player.stop();
    }

    onChange = (name, val) => {
        const obj = {};

        obj[name] = val;

        if (name === 'format' && this.state.videoFile) {
            obj.videoFile = replaceExt(this.state.videoFile, `.${val}`);
        }

        this.setState(obj);
    }

    onCancel = () => {
        this.props.onClose();
    }

    onStart = () => {
        this.props.onStart(this.state);
    }

    onOpenVideoFile = () => {
        Window.showSaveDialog(
            (filename) => {
                if (filename) {
                    this.setState({ videoFile: filename });
                }
            },
            { defaultPath: `video.${this.state.format}` },
        );
    }

    onOpenAudioFile = () => {
        const path = this.app.audioFile;

        Window.showOpenDialog(
            (files) => {
                if (files) {
                    this.app.loadAudioFile(files[0]).then(() => {
                        const audio = this.app.player.getAudio();

                        this.setState({
                            audioFile: this.app.audioFile,
                            timeStart: 0,
                            timeEnd: audio.getDuration(),
                        });
                    });
                }
            },
            { defaultPath: path },
        );
    }

    render() {
        const {
            videoFile,
            audioFile,
            format,
            resolution,
            fps,
            timeStart,
            timeEnd,
        } = this.state;
        const audio = this.app.player.getAudio();
        const max = (audio) ? audio.getDuration() : 0;
        const canStart = videoFile && audioFile;

        return (
            <SettingsPanel className={styles.panel}>
                <Settings>
                    <Row label="Save Video To">
                        <TextInput
                            className="flex"
                            inputClassName="input-normal-text"
                            name="videoFile"
                            width="100%"
                            value={videoFile}
                            readOnly
                            onChange={this.onChange}
                        />
                        <ButtonInput
                            icon={folderIcon}
                            title="Save File"
                            onClick={this.onOpenVideoFile}
                        />
                    </Row>
                    <Row label="Audio File">
                        <TextInput
                            className="flex"
                            inputClassName="input-normal-text"
                            name="audioFile"
                            width="100%"
                            value={audioFile}
                            readOnly
                            onChange={this.onChange}
                        />
                        <ButtonInput
                            icon={folderIcon}
                            title="Open File"
                            onClick={this.onOpenAudioFile}
                        />
                    </Row>
                    <Row label="Format">
                        <SelectInput
                            name="format"
                            width={80}
                            items={videoFormats}
                            value={format}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Video Resolution" className="display-none">
                        <SelectInput
                            name="resolution"
                            width={80}
                            items={resolutionOptions}
                            value={resolution}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="FPS">
                        <NumberInput
                            name="fps"
                            width={60}
                            min={24}
                            max={60}
                            value={fps}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Start Time">
                        <TimeInput
                            name="timeStart"
                            width={80}
                            min={0}
                            max={timeEnd}
                            value={timeStart}
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
                            value={timeEnd}
                            readOnly={!audio}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Total Time">
                        {formatTime(timeEnd - timeStart)}
                    </Row>
                </Settings>
                <ButtonRow>
                    <Button text="Start" onClick={this.onStart} disabled={!canStart} />
                    <Button text="Cancel" onClick={this.onCancel} />
                </ButtonRow>
            </SettingsPanel>
        );
    }
}
