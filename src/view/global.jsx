import Player from "audio/Player";
import SpectrumAnalyzer from "audio/SpectrumAnalyzer";
import EventEmitter from "core/EventEmitter";
import Logger from "core/Logger";
import Reactors from "core/Reactors";
import Renderer from "core/Renderer";
import Stage from "core/Stage";
import VideoRenderer from "video/VideoRenderer";
import * as api from "view/api";
import env from "view/env";
import { SAMPLE_RATE } from "./constants";

export { api, env };
export const audioContext = new window.AudioContext({
	sampleRate: SAMPLE_RATE,
});
export const logger = new Logger("astrofox");
export const events = new EventEmitter();
export const stage = new Stage();
export const player = new Player(audioContext);
export const analyzer = new SpectrumAnalyzer(audioContext);
export const reactors = new Reactors();
export const renderer = new Renderer();
export const videoRenderer = env.IS_WEB
	? { start: () => {}, stop: () => {} }
	: new VideoRenderer(renderer);
export const library = new Map();
