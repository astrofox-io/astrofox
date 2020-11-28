import Entity from 'core/Entity';
import { val2pct } from 'utils/math';

export default class WaveParser extends Entity {
  static defaultProperties = {
    smoothingTimeConstant: 0,
  };

  constructor(properties) {
    super('WaveParser', { ...WaveParser.defaultProperties, ...properties });

    this.output = new Float32Array(0);
    this.buffer = new Float32Array(0);
  }

  parseTimeData(data, size) {
    let { output, buffer } = this;
    const { smoothingTimeConstant } = this.properties;
    const step = data.length / size;

    // Resize data arrays
    if (output === undefined || output.length !== size) {
      output = new Float32Array(size);
      buffer = new Float32Array(size);
      this.output = output;
      this.buffer = buffer;
    }

    for (let i = 0, j = 0; i < size; i += 1, j += step) {
      output[i] = val2pct(data[~~j], -1, 1);
    }

    // Apply smoothing
    if (smoothingTimeConstant > 0) {
      for (let i = 0; i < size; i += 1) {
        output[i] = buffer[i] * smoothingTimeConstant + output[i] * (1.0 - smoothingTimeConstant);
        buffer[i] = output[i];
      }
    }

    return output;
  }
}
