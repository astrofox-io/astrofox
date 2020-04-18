import { createSlice } from '@reduxjs/toolkit';
import { analyzer, logger, player, raiseError } from 'view/global';
import { readAsArrayBuffer, readFileAsBlob } from 'utils/io';
import { loadAudioData, loadAudioTags } from 'utils/audio';
import { trimChars } from 'utils/string';
import { updateApp } from './app';

const initialState = {
  file: '',
  tags: null,
};

const audioStore = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    updateAudio(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateAudio } = audioStore.actions;

export default audioStore.reducer;

export function loadAudioFile(file) {
  return (dispatch, getState) => {
    player.stop();

    logger.time('audio-file-load');

    return readFileAsBlob(file)
      .then(blob => readAsArrayBuffer(blob))
      .then(data => loadAudioData(data))
      .then(audio => {
        player.load(audio);
        audio.addNode(analyzer.analyzer);
      })
      .then(async () => {
        await dispatch(updateAudio({ file }));

        if (getState().config.autoPlayAudio) {
          player.play();
        }

        logger.timeEnd('audio-file-load', 'audio file loaded:', file);

        return file;
      })
      .then(async file => {
        const tags = await loadAudioTags(file);
        const { artist, title } = tags;

        if (artist) {
          await dispatch(updateApp({ statusText: trimChars(`${artist} - ${title}`) }));
        }

        return dispatch(updateAudio({ tags }));
      })
      .catch(error => {
        return dispatch(raiseError('Invalid audio file.', error));
      });
  };
}
