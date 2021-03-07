import path from 'path-browserify';

import Process from 'core/Process';
import { replaceExt } from 'utils/file';

const codecOptions = {
  mp4: 'aac',
  webm: 'libvorbis',
};

const extOptions = {
  mp4: '.aac',
  webm: '.ogg',
};

export default class AudioProcess extends Process {
  start(audioFile, file, format, timeStart, timeEnd) {
    return new Promise((resolve, reject) => {
      const ext = path.extname(audioFile);
      const duration = timeEnd - timeStart;
      let codec = codecOptions[format];
      let outputExt = extOptions[format];

      // If source is already in correct format, just copy
      if (
        (format === 'mp4' && ['.m4a', '.aac'].indexOf(ext) >= 0) ||
        (format === 'webm' && ext === '.ogg')
      ) {
        codec = 'copy';
        outputExt = ext;
      }

      const outputFile = replaceExt(file, outputExt);

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

      const args = ['-y', '-i', audioFile, '-ss', timeStart, '-t', duration, '-c:a', codec];

      // Encoding options
      if (codec === 'aac') {
        args.push('-b:a', '192k');
      } else if (codec === 'libvorbis') {
        args.push('-qscale:a', 6);
      }

      // Output file
      args.push(outputFile);

      super.start(args);
    });
  }
}
