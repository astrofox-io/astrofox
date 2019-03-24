import { val2pct } from 'utils/math';

export default class WaveParser {
  parseTimeData(data, points) {
    let { output } = this;
    const step = data.length / points;
    const size = points * 2;

    if (output === undefined || output.length !== size) {
      output = new Float32Array(size);
      this.output = output;
    }

    for (let i = 0, j = 0; i < size; i += 2, j += step) {
      output[i] = ~~(i * step);
      output[i + 1] = val2pct(data[~~j], -1, 1);
    }

    return output;
  }
}
