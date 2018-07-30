import React, { Component } from 'react';
import { showOpenDialog, showSaveDialog } from 'utils/window';
import Button from 'components/interface/Button';
import withAppContext from 'components/hocs/withAppContext';
import {
    SettingsPanel,
    Settings,
    Row,
    ButtonRow,
} from 'components/layout/SettingsPanel';
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

class VideoSettings extends Component {
    static defaultProps = {
        onStart: () => {},
        onClose: () => {},
    }

    state = {
        videoFile: '',
        audioFile: '',
        format: 'mp4',
        resolution: 480,
        fps: 30,
        timeStart: 0,
        timeEnd: 0,
    }

    componentDidMount() {
        const { app: { player, audioFile } } = this.props;

        player.stop();

        const audio = player.getAudio();

        if (audio) {
            this.setState({
                audioFile,
                timeEnd: audio.getDuration(),
            });
        }
    }

    onChange = (name, value) => {
        const { videoFile } = this.state;
        const obj = {};

        obj[name] = value;

        if (name === 'format' && videoFile) {
            obj.videoFile = replaceExt(videoFile, `.${value}`);
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
        showSaveDialog(
            (filename) => {
                if (filename) {
                    this.setState({ videoFile: filename });
                }
            },
            { defaultPath: `video.${this.state.format}` },
        );
    }

    onOpenAudioFile = () => {
        const { app } = this.props;

        showOpenDialog(
            (files) => {
                if (files) {
                    app.loadAudioFile(files[0]).then(() => {
                        const audio = app.player.getAudio();

                        this.setState({
                            audioFile: app.audioFile,
                            timeStart: 0,
                            timeEnd: Math.ceil(audio.getDuration()),
                        });
                    });
                }
            },
            { defaultPath: app.audioFile },
        );
    }

    render() {
        const { app } = this.props;
        const {
            videoFile,
            audioFile,
            format,
            resolution,
            fps,
            timeStart,
            timeEnd,
        } = this.state;
        const audio = app.player.getAudio();
        const max = (audio) ? audio.getDuration() : 0;
        const canStart = videoFile && audioFile;

        return (
            <SettingsPanel className={styles.panel}>
                <Settings>
                    <Row label="Save Video To">
                        <TextInput
                            inputClassName="input-normal-text"
                            name="videoFile"
                            width={250}
                            value={videoFile}
                            readOnly
                            onChange={this.onChange}
                        />
                        <ButtonInput
                            className={styles.button}
                            icon={folderIcon}
                            title="Save File"
                            onClick={this.onOpenVideoFile}
                        />
                    </Row>
                    <Row label="Audio File">
                        <TextInput
                            inputClassName="input-normal-text"
                            name="audioFile"
                            width={250}
                            value={audioFile}
                            readOnly
                            onChange={this.onChange}
                        />
                        <ButtonInput
                            className={styles.button}
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
                            disabled={!audio}
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
                            disabled={!audio}
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

export default withAppContext(VideoSettings);
