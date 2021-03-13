import Process from 'core/Process';
import { replaceExt } from 'utils/file';

const codecOptions = {
  mp4: 'libx264',
  webm: 'libvpx',
};

const ffmpegQualityOptions = {
  Low: ['-preset', 'veryfast', '-crf', 23],
  Medium: ['-preset', 'medium', '-crf', 20],
  High: ['-preset', 'slow', '-crf', 18],
};

const webmQualityOptions = {
  Low: ['-crf', 10],
  Medium: ['-crf', 5],
  High: ['-crf', 4],
};

export default class RenderProcess extends Process {
  start(file, format, fps, quality) {
    return new Promise((resolve, reject) => {
      const codec = codecOptions[format];
      const outputFile = replaceExt(file, `.${format}`);

      this.on('close', code => {
        if (code !== 0) {
          reject(new Error('Process was terminated.'));
        }
        resolve(outputFile);
      });

      this.on('error', err => {
        reject(err);
      });

      this.on('stderr', data => {
        this.emit('output', data);
      });

      let args = [
        '-y',
        '-stats',
        '-r',
        fps,
        '-f',
        'image2pipe',
        '-c:v',
        'png',
        '-i',
        'pipe:0',
        '-c:v',
        codec,
        '-pix_fmt',
        'yuv420p',
        '-f',
        format,
        '-analyzeduration',
        2147483647,
        '-probesize',
        2147483647,
      ];

      // Encoding options
      if (format === 'mp4') {
        args = [
          ...args,
          ...ffmpegQualityOptions[quality],
          '-profile:v',
          'high',
          '-tune',
          'animation',
          '-movflags',
          '+faststart',
        ];
      } else if (format === 'webm') {
        args = [
          ...args,
          '-quality',
          'good',
          '-cpu-used',
          0,
          '-qmin',
          0,
          '-qmax',
          50,
          '-b:v',
          '20M',
          ...webmQualityOptions[quality],
        ];
      }

      // Output file
      args.push(outputFile);

      super.start(args);
    });
  }
}
