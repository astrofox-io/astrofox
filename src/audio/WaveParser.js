import { val2pct } from 'utils/math';

export default class WaveParser {
  parseTimeData(data, points) {
    let { output } = this;
    const step = data.length / points;

    if (output === undefined || output.length !== points) {
      output = new Float32Array(points);
      this.output = output;
    }

    for (let i = 0, j = 0; i < points; i++, j += step) {
      output[i] = val2pct(data[~~j], -1, 1);
    }

    return output;
  }
}
