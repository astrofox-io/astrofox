import Process from 'core/Process';
import { replaceExt } from 'utils/file';
import videoConfig from 'config/video.json';

export default class RenderProcess extends Process {
  start(file, codec, fps, quality) {
    return new Promise((resolve, reject) => {
      const { extension, settings, encoder } = videoConfig.codecs[codec].video;
      const outputFile = replaceExt(file, `.${extension}`);

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

      // Encoding options
      const args = [
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
        encoder,
        '-pix_fmt',
        'yuv420p',
        '-f',
        extension,
        '-analyzeduration',
        2147483647,
        '-probesize',
        2147483647,
        ...settings.default,
        ...settings[quality],
        outputFile
      ];

      super.start(args);
    });
  }
}
