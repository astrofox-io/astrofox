import path from 'path-browserify';
import Process from 'core/Process';
import { replaceExt } from 'utils/file';
import videoConfig from 'config/video.json';

export default class AudioProcess extends Process {
  start(audioFile, file, codec, timeStart, timeEnd) {
    return new Promise((resolve, reject) => {
      const ext = path.extname(audioFile);
      const duration = timeEnd - timeStart;
      const { encoder, extension, settings } = videoConfig.codecs[codec].audio;

      // If source is already in correct format, just copy
      if (
        (/x264|nvenc/.test(codec) && /\.(mp4|aac)/.test(ext)) ||
        (codec === 'webm' && ext === '.ogg')
      ) {
        codec = 'copy';
      }

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
        '-i',
        audioFile,
        '-ss',
        timeStart,
        '-t',
        duration,
        '-c:a',
        encoder,
        ...settings,
        outputFile,
      ];

      super.start(args);
    });
  }
}
