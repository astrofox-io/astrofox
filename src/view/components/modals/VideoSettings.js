import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { player } from 'global';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Row } from 'components/layout/SettingsPanel';
import ButtonRow from 'components/layout/ButtonRow';
import { ButtonInput, NumberInput, TimeInput, SelectInput, TextInput } from 'components/inputs';
import { showSaveDialog } from 'utils/window';
import { replaceExt } from 'utils/file';
import { formatTime } from 'utils/format';
import { FolderOpen } from 'view/icons';
import { openAudioFile } from 'actions/audio';
import { startRender } from 'actions/video';
import styles from './VideoSettings.less';

const videoFormats = ['mp4', 'webm'];

const initialState = {
  videoFile: '',
  format: 'mp4',
  fps: 30,
  timeStart: 0,
  timeEnd: 0,
};

export default function VideoSettings({ onClose }) {
  const dispatch = useDispatch();
  const { file: audioFile, duration } = useSelector(state => state.audio);
  const [state, setState] = useState(initialState);
  const { videoFile, format, fps, timeStart, timeEnd } = state;
  const canStart = videoFile && audioFile && timeEnd - timeStart > 0;

  useEffect(() => {
    player.stop();

    setState(state => ({
      ...state,
      audioFile,
      timeEnd: duration,
    }));
  }, []);

  function handleChange(name, value) {
    const props = { [name]: value };

    if (name === 'format' && videoFile) {
      props.videoFile = replaceExt(videoFile, `.${value}`);
    }

    setState(state => ({ ...state, ...props }));
  }

  function handleCancel() {
    onClose();
  }

  function handleStart() {
    dispatch(startRender({ ...state, audioFile }));
    onClose();
  }

  async function handleOpenVideoFile() {
    const { filePath, canceled } = await showSaveDialog({ defaultPath: `video.${format}` });

    if (!canceled) {
      setState(state => ({ ...state, videoFile: replaceExt(filePath, `.${format}`) }));
    }
  }

  async function handleOpenAudioFile() {
    await dispatch(openAudioFile(false));

    const duration = player.getDuration();

    setState(state => ({
      ...state,
      timeStart: 0,
      timeEnd: Math.ceil(duration),
    }));
  }

  return (
    <SettingsPanel className={styles.panel}>
      <Settings>
        <Row label="Save Video To">
          <TextInput
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
            disabled={!audioFile}
            onChange={handleChange}
          />
        </Row>
        <Row label="End Time">
          <TimeInput
            name="timeEnd"
            width={80}
            min={0}
            max={duration}
            value={timeEnd}
            disabled={!audioFile}
            onChange={handleChange}
          />
        </Row>
        <Row label="Total Time">
          {formatTime(timeEnd - timeStart)} / {formatTime(duration)}
        </Row>
      </Settings>
      <ButtonRow>
        <Button text="Start" onClick={handleStart} disabled={!canStart} />
        <Button text="Cancel" onClick={handleCancel} />
      </ButtonRow>
    </SettingsPanel>
  );
}
