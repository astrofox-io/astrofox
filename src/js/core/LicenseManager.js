import NodeRSA from 'node-rsa';
import { LICENSE_FILE } from './Environment';
import { logger } from './Global';
import { readFile } from '../util/io';

import KEY_DATA from '../../config/key.json';

export default class LicenseManager {
    constructor() {
        this.license = null;
        this.key = new NodeRSA(KEY_DATA);
    }

    init() {
        return readFile(LICENSE_FILE)
            .then(data => {
                this.license = JSON.parse(this.key.decryptPublic(data).toString());
                logger.log('License found:', this.license);
            })
            .catch(error => {
                if (error.message.indexOf('ENOENT') > -1) {
                    logger.log('License not found.');
                }
                else {
                    logger.error(error.message);
                }
            });
    }

    check() {
        return false;
    }
}