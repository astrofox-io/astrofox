import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api, player } from 'global';
import { Settings, Setting } from 'components/editing';
import Layout from 'components/layout/Layout';
import Button from 'components/interface/Button';
import ButtonRow from 'components/layout/ButtonRow';
import TimeInfo from 'components/player/TimeInfo';
import { ButtonInput } from 'components/inputs';
import { replaceExt } from 'utils/file';
import { FolderOpen } from 'view/icons';
import { openAudioFile } from 'actions/audio';
import { startRender } from 'actions/video';

const videoFormats = ['mp4', 'webm'];

const initialState = {
  videoFile: '',
  format: 'mp4',
  fps: 60,
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

  function handleChange(props) {
    if (props.format && videoFile) {
      props.videoFile = replaceExt(videoFile, `.${props.format}`);
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
    const { filePath, canceled } = await api.showSaveDialog({ defaultPath: `video.${format}` });

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
    <Layout width={700}>
      <Settings labelWidth="40%" onChange={handleChange}>
        <Setting
          label="Save Video To"
          type="text"
          name="videoFile"
          width={300}
          value={videoFile}
          readOnly
        >
          <ButtonInput icon={FolderOpen} title="Save File" onClick={handleOpenVideoFile} />
        </Setting>
        <Setting
          label="Audio File"
          type="text"
          name="audioFile"
          width={300}
          value={audioFile}
          readOnly
        >
          <ButtonInput icon={FolderOpen} title="Open File" onClick={handleOpenAudioFile} />
        </Setting>
        <Setting label="Format" type="select" name="format" items={videoFormats} value={format} />
        <Setting label="FPS" type="number" name="fps" min={1} max={60} value={fps} />
        <Setting
          label="Start Time"
          type="time"
          name="timeStart"
          width={80}
          min={0}
          max={timeEnd}
          value={timeStart}
          disabled={!audioFile}
        />
        <Setting
          label="End Time"
          type="time"
          name="timeEnd"
          width={80}
          min={0}
          max={duration}
          value={timeEnd}
          disabled={!audioFile}
        />
        <Setting label="Total Time">
          <TimeInfo currentTime={timeEnd - timeStart} totalTime={duration} />
        </Setting>
      </Settings>
      <ButtonRow>
        <Button text="Start" onClick={handleStart} disabled={!canStart} />
        <Button text="Cancel" onClick={handleCancel} />
      </ButtonRow>
    </Layout>
  );
}
