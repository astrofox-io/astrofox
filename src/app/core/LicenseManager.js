import crypto from 'crypto';
import { Map } from 'immutable';
import { logger } from 'core/Global';
import { readFile, writeFile } from 'utils/io';

const emptyLicense = Map({});

export default class LicenseManager {
    constructor(key) {
        this.license = emptyLicense;
        this.key = key;
    }

    load(file) {
        return readFile(file)
            .then((data) => {
                this.license = Map(JSON.parse(crypto.publicDecrypt(this.key, data).toString()));

                logger.log('License found:', this.license.toObject());
            })
            .catch((error) => {
                if (error.message.indexOf('ENOENT') > -1) {
                    logger.log('License not found.');
                }
                else {
                    logger.error('Invalid license:', error.message);
                }
            });
    }

    save(file, data) {
        return writeFile(file, data)
            .then(() => {
                this.license = Map(data);

                logger.log('License file saved.');
            })
            .catch((error) => {
                logger.error(error.message);
            });
    }

    info() {
        return this.license.toObject();
    }

    check() {
        return this.license !== emptyLicense;
    }
}
