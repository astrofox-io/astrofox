import { combineReducers } from 'redux';
import app from 'actions/app';
import config from 'actions/config';
import project from 'actions/project';
import audio from 'actions/audio';
import video from 'actions/video';
import stage from 'actions/stage';
import scenes from 'actions/scenes';
import displays from 'actions/displays';
import effects from 'actions/effects';
import errors from 'actions/errors';

export default combineReducers({
  app,
  config,
  project,
  audio,
  video,
  stage,
  scenes,
  displays,
  effects,
  errors,
});
