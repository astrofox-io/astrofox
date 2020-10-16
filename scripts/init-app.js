const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const pkg = require('../package.json');

const dest = path.resolve(__dirname, '../app');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

const { name, version, productName, description, author, license, homepage, repository } = pkg;

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

fs.writeFileSync(path.join(dest, 'package.json'), json);
