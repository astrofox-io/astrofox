import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { player } from 'global';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Row } from 'components/layout/SettingsPanel';
import ButtonRow from 'components/layout/ButtonRow';
import { ButtonInput, NumberInput, TimeInput, SelectInput, TextInput } from 'components/inputs';
import { showOpenDialog, showSaveDialog } from 'utils/window';
import { replaceExt } from 'utils/file';
import { formatTime } from 'utils/format';
import { FolderOpen } from 'icons';
import styles from './VideoSettings.less';

const videoFormats = ['mp4', 'webm'];

const resolutionOptions = [480, 720, 1080];

const defaultState = {
  videoFile: '',
  audioFile: '',
  format: 'mp4',
  resolution: 480,
  fps: 30,
  timeStart: 0,
  timeEnd: 0,
};

export default function VideoSettings({ onStart, onClose }) {
  const appConfig = useSelector(({ app }) => app);
  const [state, setState] = useState({ ...defaultState, audioFile: appConfig.audioFile });
  const { videoFile, audioFile, format, resolution, fps, timeStart, timeEnd } = state;

  useEffect(() => {
    player.stop();

    const audio = player.getAudio();

    if (audio) {
      setState({
        audioFile,
        timeEnd: audio.getDuration(),
      });
    }
  }, []);

  function handleChange(name, value) {
    const obj = {};

    obj[name] = value;

    if (name === 'format' && videoFile) {
      obj.videoFile = replaceExt(videoFile, `.${value}`);
    }

    setState({ ...state, ...obj });
  }

  function handleCancel() {
    onClose();
  }

  function handleStart() {
    onStart(state);
  }

  function handleOpenVideoFile() {
    showSaveDialog(
      filename => {
        if (filename) {
          setState({ ...state, videoFile: filename });
        }
      },
      { defaultPath: `video.${state.format}` },
    );
  }

  function handleOpenAudioFile() {
    showOpenDialog(
      files => {
        if (files) {
          app.loadAudioFile(files[0]).then(() => {
            const audio = player.getAudio();

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

  const audio = player.getAudio();
  const max = audio ? audio.getDuration() : 0;
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
            onChange={handleChange}
          />
          <ButtonInput
            className={styles.button}
            icon={FolderOpen}
            title="Save File"
            onClick={handleOpenVideoFile}
          />
        </Row>
        <Row label="Audio File">
          <TextInput
            inputClassName="input-normal-text"
            name="audioFile"
            width={250}
            value={audioFile}
            readOnly
            onChange={handleChange}
          />
          <ButtonInput
            className={styles.button}
            icon={FolderOpen}
            title="Open File"
            onClick={handleOpenAudioFile}
          />
        </Row>
        <Row label="Format">
          <SelectInput
            name="format"
            width={80}
            items={videoFormats}
            value={format}
            onChange={handleChange}
          />
        </Row>
        <Row label="Video Resolution" className="display-none">
          <SelectInput
            name="resolution"
            width={80}
            items={resolutionOptions}
            value={resolution}
            onChange={handleChange}
          />
        </Row>
        <Row label="FPS">
          <NumberInput
            name="fps"
            width={60}
            min={24}
            max={60}
            value={fps}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
          />
        </Row>
        <Row label="Total Time">{formatTime(timeEnd - timeStart)}</Row>
      </Settings>
      <ButtonRow>
        <Button text="Start" onClick={handleStart} disabled={!canStart} />
        <Button text="Cancel" onClick={handleCancel} />
      </ButtonRow>
    </SettingsPanel>
  );
}
