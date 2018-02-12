import { val2pct } from 'utils/math';

export default class WaveParser {
    static parseTimeData(data, points, distance = 0) {
        const results = [];

        // Get points
        if (distance > 0) {
            const step = data.length / (points / distance);

            for (let i = 0, j = 0; j < points; i += step, j += distance) {
                results.push(~~j);
                results.push(val2pct(data[~~i], -1, 1));

                // Fix last point
                if (j + distance >= points) {
                    results[results.length - 2] = points;
                    results[results.length - 1] = val2pct(data[data.length - 1], -1, 1);
                }
            }
        }
        else {
            const step = data.length / points;

            for (let i = 0, j = 0; j < points; i += step, j += 1) {
                results.push(j);
                results.push(val2pct(data[~~i], -1, 1));
            }
        }

        return results;
    }
}
