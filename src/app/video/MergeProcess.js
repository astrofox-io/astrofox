import Process from 'core/Process';

export default class MergeProcess extends Process {
    start(videoFile, audioFile, outputFile) {
        return new Promise((resolve, reject) => {
            this.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error('Process was terminated.'));
                }
                resolve();
            });

            this.on('error', (err) => {
                reject(err);
            });

            this.on('stderr', (data) => {
                this.emit('data', data);
            });

            super.start([
                '-y',
                '-i', videoFile,
                '-i', audioFile,
                '-codec', 'copy',
                '-shortest',
                '-movflags', '+faststart',
                outputFile,
            ]);
        });
    }
}
