import { combineReducers } from 'redux';
import app from 'actions/app';
import audio from 'actions/audio';
import config from 'actions/config';
import errors from 'actions/errors';
import modals from 'actions/modals';
import project from 'actions/project';
import reactors from 'actions/reactors';
import scenes from 'actions/scenes';
import stage from 'actions/stage';
import updates from 'actions/updates';
import video from 'actions/video';

export default combineReducers({
  app,
  audio,
  config,
  errors,
  modals,
  project,
  reactors,
  scenes,
  stage,
  updates,
  video,
});
