import { createSlice } from '@reduxjs/toolkit';
import { analyzer, logger, player } from 'view/global';
import { updateApp } from 'actions/app';
import { raiseError } from 'actions/errors';
import { readAsArrayBuffer, readFileAsBlob } from 'utils/io';
import { loadAudioData, loadAudioTags } from 'utils/audio';
import { trimChars } from 'utils/string';
import { showOpenDialog } from 'utils/window';

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

        logger.timeEnd('audio-file-load', 'Audio file loaded:', file);

        return file;
      })
      .then(async file => {
        const tags = await loadAudioTags(file);
        const { artist, title } = tags;

        if (artist) {
          await dispatch(updateApp({ statusText: trimChars(`${artist} - ${title}`) }));
        }

        dispatch(updateAudio({ tags }));
      })
      .catch(error => {
        dispatch(raiseError('Invalid audio file.', error));
      });
  };
}

export function openAudioFile() {
  return dispatch => {
    showOpenDialog({
      filters: [
        {
          name: 'audio files',
          extensions: ['aac', 'mp3', 'm4a', 'ogg', 'wav'],
        },
      ],
    }).then(({ filePaths, canceled }) => {
      if (!canceled) {
        dispatch(loadAudioFile(filePaths[0]));
      }
    });
  };
}
