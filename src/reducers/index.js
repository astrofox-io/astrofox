import { combineReducers } from 'redux';
import app from 'actions/app';
import audio from 'actions/audio';
import config from 'actions/config';
import displays from 'actions/displays';
import effects from 'actions/effects';
import errors from 'actions/errors';
import modals from 'actions/modals';
import project from 'actions/project';
import scenes from 'actions/scenes';
import stage from 'actions/stage';
import video from 'actions/video';

export default combineReducers({
  app,
  audio,
  config,
  displays,
  effects,
  errors,
  modals,
  project,
  scenes,
  stage,
  video,
});
