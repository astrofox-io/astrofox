import EventEmitter from 'core/EventEmitter';
import Logger from 'core/Logger';
import Renderer from 'core/Renderer';
import Reactors from 'core/Reactors';
import Stage from 'core/Stage';
import AppUpdater from 'core/AppUpdater';
import Player from 'audio/Player';
import SpectrumAnalyzer from 'audio/SpectrumAnalyzer';
import VideoRenderer from 'video/VideoRenderer';

export const api = window.__ASTROFOX__;
export const env = api.getEnvironment();
export const audioContext = new window.AudioContext();
export const logger = new Logger('astrofox');
export const events = new EventEmitter();
export const stage = new Stage();
export const player = new Player(audioContext);
export const analyzer = new SpectrumAnalyzer(audioContext);
export const updater = new AppUpdater();
export const reactors = new Reactors();
export const renderer = new Renderer();
export const videoRenderer = new VideoRenderer(renderer);

export function getEnvironment() {
  return api.getEnvironment();
}
