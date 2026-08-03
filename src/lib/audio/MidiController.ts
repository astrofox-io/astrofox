const NOTE_COUNT = 128;
const CONTROL_COUNT = 128;
const BASE_WAVE_CYCLES = 2;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export interface MidiAnalysisData {
  fft: Uint8Array;
  td: Float32Array;
  gain: number;
  activity: number;
}

export default class MidiController {
  fft: Uint8Array = new Uint8Array();
  td: Float32Array = new Float32Array();
  noteLevels: Float32Array = new Float32Array(NOTE_COUNT);
  controlLevels: Float32Array = new Float32Array(CONTROL_COUNT);
  gain = 0;
  activity = 0;
  modulation = 0;
  pitchBend = 0.5;
  phase = 0;
  lastFrameTime = 0;

  reset() {
    this.noteLevels.fill(0);
    this.controlLevels.fill(0);
    this.fft.fill(0);
    this.td.fill(0);
    this.gain = 0;
    this.activity = 0;
    this.modulation = 0;
    this.pitchBend = 0.5;
    this.phase = 0;
    this.lastFrameTime = 0;
  }

  handleMessage(event: { data?: Uint8Array | number[] | null }) {
    const data = event.data;

    if (!data || data.length < 2) {
      return;
    }

    const status = Number(data[0]) & 0xf0;
    const data1 = Number(data[1]) || 0;
    const data2 = Number(data[2]) || 0;
    const velocity = clamp01(data2 / 127);

    switch (status) {
      case 0x80:
        this.noteLevels[data1] = 0;
        break;

      case 0x90:
        this.noteLevels[data1] = data2 > 0 ? velocity : 0;
        break;

      case 0xb0:
        this.controlLevels[data1] = velocity;

        if (data1 === 1) {
          this.modulation = velocity;
        }
        break;

      case 0xe0: {
        const bend = ((data2 << 7) | data1) / 16383;
        this.pitchBend = clamp01(bend);
        break;
      }
    }

    this.activity = Math.max(this.activity, velocity);
  }

  updateAnalysis(fftSize: number, currentTime: number): MidiAnalysisData {
    const frequencyBins = fftSize / 2;

    if (this.fft.length !== frequencyBins) {
      this.fft = new Uint8Array(frequencyBins);
    }

    if (this.td.length !== fftSize) {
      this.td = new Float32Array(fftSize);
    }

    const delta =
      this.lastFrameTime > 0 ? Math.max(1 / 240, currentTime - this.lastFrameTime) : 1 / 60;
    this.lastFrameTime = currentTime;

    const noteDecay = 0.18 ** (delta * 2.5);
    const controlDecay = 0.3 ** (delta * 1.5);
    const activityDecay = 0.1 ** (delta * 2);

    let total = 0;

    for (let i = 0; i < NOTE_COUNT; i += 1) {
      this.noteLevels[i] *= noteDecay;
      total += this.noteLevels[i];
    }

    for (let i = 0; i < CONTROL_COUNT; i += 1) {
      this.controlLevels[i] *= controlDecay;
      total += this.controlLevels[i] * 0.35;
    }

    this.activity *= activityDecay;

    const energy = clamp01(total / 20 + this.activity * 0.5);
    const cycles = BASE_WAVE_CYCLES + this.modulation * 5 + Math.abs(this.pitchBend - 0.5) * 6;
    this.phase += delta * (4 + energy * 14);

    for (let i = 0; i < frequencyBins; i += 1) {
      const noteIndex = Math.min(
        NOTE_COUNT - 1,
        Math.floor((i / Math.max(1, frequencyBins - 1)) * NOTE_COUNT),
      );
      const controlIndex = Math.min(
        CONTROL_COUNT - 1,
        Math.floor((i / Math.max(1, frequencyBins - 1)) * CONTROL_COUNT),
      );
      const value = clamp01(
        this.noteLevels[noteIndex] * 1.2 + this.controlLevels[controlIndex] * 0.8 + energy * 0.2,
      );

      this.fft[i] = Math.round(value * 255);
    }

    for (let i = 0; i < fftSize; i += 1) {
      const progress = i / Math.max(1, fftSize - 1);
      const wave = Math.sin(progress * Math.PI * 2 * cycles + this.phase) * energy;

      this.td[i] = wave;
    }

    this.gain = this.fft.length
      ? this.fft.reduce((sum, value) => sum + value, 0) / this.fft.length
      : 0;

    return {
      fft: this.fft,
      td: this.td,
      gain: this.gain,
      activity: this.activity,
    };
  }

  getAnalysisData(): MidiAnalysisData {
    return {
      fft: this.fft,
      td: this.td,
      gain: this.gain,
      activity: this.activity,
    };
  }
}
