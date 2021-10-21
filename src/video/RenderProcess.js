import Process from 'core/Process';
import { replaceExt } from 'utils/file';
import videoConfig from 'config/video.json';

export default class RenderProcess extends Process {
  start({ outputFile, codec, fps, quality, width, height }) {
    return new Promise((resolve, reject) => {
      const { extension, settings, encoder } = videoConfig.codecs[codec].video;
      const output = replaceExt(outputFile, `.${extension}`);

      this.on('close', code => {
        if (code !== 0) {
          reject(new Error('Process terminated.'));
        }
        resolve(output);
      });

      this.on('error', err => {
        reject(err);
      });

      this.on('stderr', data => {
        this.emit('output', data);
      });

      // Encoding options
      const args = [
        '-loglevel',
        'debug',
        '-y',
        '-stats',
        '-f',
        'rawvideo',
        '-c:v',
        'rawvideo',
        '-pix_fmt',
        'rgba',
        '-s',
        `${width}x${height}`,
        '-r',
        fps,
        ...settings.input,
        '-i',
        'pipe:0',
        '-c:v',
        encoder,
        '-f',
        extension,
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'vflip',
        ...settings.output,
        ...settings[quality],
        output
      ];

      super.start(args);
    });
  }
}
