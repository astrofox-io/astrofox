import crypto from 'crypto';
import { Map } from 'immutable';
import { logger } from 'app/global';
import { readFile, writeFile } from 'utils/io';

const emptyLicense = Map({});

export default class LicenseManager {
    constructor(key) {
        this.license = emptyLicense;
        this.key = key;
    }

    get info() {
        return this.license.toObject();
    }

    get valid() {
        const { license, info } = this;

        return (
            license !== emptyLicense &&
            info && info.user
        );
    }

    decrypt(data) {
        return JSON.parse(crypto.publicDecrypt(this.key, data).toString());
    }

    load(file) {
        return readFile(file)
            .then((data) => {
                const info = this.decrypt(data);

                if (info && info.user) {
                    this.license = Map(info);

                    logger.log('License found:', this.info);
                }
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
                const info = this.decrypt(data);

                if (info && info.user) {
                    this.license = Map(info);

                    logger.log('License file saved.');
                }
                else {
                    logger.error('Invalid license data.');
                }
            })
            .catch((error) => {
                logger.error(error.message);
            });
    }
}
