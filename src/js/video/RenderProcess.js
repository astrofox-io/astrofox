import Process from '../core/Process';
import { replaceExt } from '../util/file';

const codecs = {
    mp4: 'libx264',
    webm: 'libvpx'
};

export default class RenderProcess extends Process {
    constructor(command) {
        super(command);
    }

    start(outputFile, format, fps) {
        return new Promise((resolve, reject) => {
            let codec = codecs[format];

            outputFile = replaceExt(outputFile, '.' + format);

            this.on('close', code => {
                if (code !== 0) {
                    reject('Process was terminated.');
                }
                resolve(outputFile);
            });

            this.on('error', err => {
                reject(err);
            });

            this.on('stderr', data => {
                this.emit('data', data);
            });

            let args = [
                '-y',
                '-stats',
                '-r', fps,
                '-f', 'image2pipe',
                '-c:v', 'png',
                '-i', 'pipe:0',
                '-c:v', codec,
                '-pix_fmt', 'yuv420p',
                '-f', format,
            ];

            // Encoding options
            if (format === 'mp4') {
                args.push(
                    '-profile:v', 'high',
                    '-preset', 'slow',
                    '-crf', 18,
                    '-tune', 'animation',
                    '-movflags', '+faststart'
                );
            }
            else if (format === 'webm') {
                args.push(
                    '-quality', 'good',
                    '-cpu-used', 0,
                    '-qmin', 0,
                    '-qmax', 50,
                    '-b:v', '20M',
                    '-crf', 4
                );
            }

            // Output file
            args.push(outputFile);

            super.start(args);
        });
    }
}