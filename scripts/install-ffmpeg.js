const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const dest = path.resolve(__dirname, '../bin');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

const platform = os.platform();

if (!['win32', 'darwin', 'linux'].includes(platform)) {
  throw new Error('Unsupported platform');
}

const files = {
  win32: ['win', 'ffmpeg.exe'],
  darwin: ['mac', 'ffmpeg'],
  linux: ['linux', 'ffmpeg'],
};

const download = async (url, file) => {
  const filename = path.join(dest, file);

  console.log(`Downloading ${url} -> ${filename}`);

  await new Promise(resolve => {
    https.get(url, res => {
      resolve(res.pipe(fs.createWriteStream(filename)));
    });
  });
};

const [dir, file] = files[platform];
const url = `https://files.astrofox.io/ffmpeg/${dir}/${file}`;

download(url, file);
