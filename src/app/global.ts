import * as api from '@/app/api-client';
import env from '@/app/env';
// @ts-nocheck
import Player from '@/lib/audio/Player';
import SpectrumAnalyzer from '@/lib/audio/SpectrumAnalyzer';
import EventEmitter from '@/lib/core/EventEmitter';
import Logger from '@/lib/core/Logger';
import Reactors from '@/lib/core/Reactors';
import Renderer from '@/lib/core/Renderer';
import { CompositorBackend } from '@/lib/core/render';
import Stage from '@/lib/core/Stage';
import { SAMPLE_RATE } from './constants';

export { api, env };
export const audioContext = new window.AudioContext({
  sampleRate: SAMPLE_RATE,
});
export const logger = new Logger('astrofox');
export const events = new EventEmitter();
export const stage = new Stage();
export const renderBackend = new CompositorBackend(stage);
export const player = new Player(audioContext);
export const analyzer = new SpectrumAnalyzer(audioContext);
export const reactors = new Reactors();
export const renderer = new Renderer();
export const library = new Map();
