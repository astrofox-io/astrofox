import { remote } from 'electron';
import EventEmitter from 'core/EventEmitter';
import Logger from 'core/Logger';
import Renderer from 'core/Renderer';
import Reactors from 'core/Reactors';
import Stage from 'core/Stage';
import AppUpdater from 'core/AppUpdater';
import LicenseManager from 'core/LicenseManager';
import Player from 'audio/Player';
import SpectrumAnalyzer from 'audio/SpectrumAnalyzer';
import VideoRenderer from 'video/VideoRenderer';
import { PUBLIC_KEY } from 'view/constants';

export function getEnvironment() {
  return remote.getGlobal('env');
}

export const audioContext = new window.AudioContext();
export const logger = new Logger('astrofox');
export const events = new EventEmitter();
export const stage = new Stage();
export const player = new Player(audioContext);
export const analyzer = new SpectrumAnalyzer(audioContext);
export const updater = new AppUpdater();
export const license = new LicenseManager(PUBLIC_KEY);
export const reactors = new Reactors();
export const renderer = new Renderer();
export const videoRenderer = new VideoRenderer(renderer);
export const env = getEnvironment();
