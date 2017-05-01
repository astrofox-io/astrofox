import { val2pct } from '../util/math';

export default class WaveParser {
    static parseTimeData(data, points, distance) {
        let i, j, step,
            results = [];

        distance = distance || 0;

        // Get points
        if (distance > 0) {
            step = data.length / (points / distance);

            for (i = 0, j = 0; j < points; i += step, j += distance) {
                results.push(~~j);
                results.push(val2pct(data[~~i], -1, 1));

                // Fix last point
                if (j + distance >= points) {
                    results[results.length - 2] = points;
                    results[results.length - 1] = val2pct(data[data.length-1], -1, 1);
                }
            }
        }
        else {
            step = data.length / points;

            for (i = 0, j = 0; j < points; i += step, j++) {
                results.push(j);
                results.push(val2pct(data[~~i], -1, 1));
            }
        }

        return results;
    }
}