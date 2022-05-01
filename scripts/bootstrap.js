const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const pkg = require('../package.json');

const appFolder = path.resolve(__dirname, '../app');
const distFolder = path.resolve(__dirname, '../node_modules/electron/dist/resources');

if (!fs.existsSync(appFolder)) {
  fs.mkdirSync(appFolder);
}

const { name, version, productName, description, author, license, homepage, repository } = pkg;

// Create package.json file in app directory
const json = prettier.format(
  JSON.stringify({
    name,
    version,
    productName,
    description,
    author,
    license,
    homepage,
    repository,
    main: 'main.js',
    dependencies: {},
  }),
  { parser: 'json' },
);

fs.writeFileSync(path.join(appFolder, 'package.json'), json);


// Create app-update.yml files
const srcFile = path.resolve(__dirname, '../src/build/app/dev-app-update.yml')
fs.copyFileSync(srcFile, path.resolve(appFolder, 'dev-app-update.yml'));
fs.copyFileSync(srcFile, path.resolve(distFolder, 'app-update.yml'));
