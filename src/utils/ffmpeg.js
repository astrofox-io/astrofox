import Process from 'core/Process';

export function getVersion(ffmpeg) {
    return new Promise((resolve, reject) => {
        let buffer = '';

        const process = new Process(ffmpeg);

        process.on('stdout', (data) => {
            buffer += data.toString();
        });

        process.on('error', (err) => {
            reject(err);
        });

        process.on('close', () => {
            const lines = buffer.split(/\r\n|\r|\n/);
            const regex = /^ffmpeg version ([^ ]+)/;
            const match = lines[0].match(regex);

            if (match) {
                resolve(match[1]);
            }

            reject(new Error('Invalid file'));
        });

        process.start(['-version']);
    });
}

export function getFormats(ffmpeg) {
    return new Promise((resolve, reject) => {
        let buffer = '';

        const process = new Process(ffmpeg);

        process.on('stdout', (data) => {
            buffer += data.toString();
        });

        process.on('error', (err) => {
            reject(err);
        });

        process.on('close', () => {
            const formats = {};
            const lines = buffer.split(/\r\n|\r|\n/);
            const regex = /^\s*([D ])([E ]) ([^ ]+) +(.*)$/;

            lines.forEach((line) => {
                const match = line.match(regex);
                if (match) {
                    match[3].split(',').forEach((id) => {
                        formats[id] = {
                            description: match[4],
                            canDemux: match[1] === 'D',
                            canMux: match[2] === 'E',
                        };
                    });
                }
            });

            resolve(formats);
        });

        process.start(['-formats']);
    });
}

export function getCodecs(ffmpeg) {
    return new Promise((resolve, reject) => {
        let buffer = '';

        const process = new Process(ffmpeg);

        process.on('stdout', (data) => {
            buffer += data.toString();
        });

        process.on('error', (err) => {
            reject(err);
        });

        process.on('close', () => {
            const codecs = { audio: {}, video: {}, subtitle: {} };
            const lines = buffer.split(/\r\n|\r|\n/);
            const regex = /^\s*([D.])([E.])([VAS])([I.])([L.])([S.]) ([^ ]+) +(.*)$/;
            const types = { V: 'video', A: 'audio', S: 'subtitle' };

            lines.forEach((line) => {
                const match = line.match(regex);
                if (match && match[7] !== '=') {
                    codecs[types[match[3]]][match[7]] = {
                        description: match[8],
                        canDecode: match[1] === 'D',
                        canEncode: match[2] === 'E',
                        intraFrameOnly: match[4] === 'I',
                        isLossy: match[5] === 'L',
                        isLossless: match[6] === 'S',
                    };
                }
            });

            resolve(codecs);
        });

        process.start(['-codecs']);
    });
}
