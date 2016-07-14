'use strict';

const defaults = {
    enabled: true
};

let displayId = 0;
const displayCount = {};

class Display {
    constructor(name, options) {
        this.id = displayId++;
        this.name = name;

        if (typeof displayCount[name] === 'undefined') {
            displayCount[name] = 1;
        }

        this.options = Object.assign({ displayName: name + ' ' + displayCount[name]++ }, defaults, options);
        this.owner = null;
        this.hasUpdate = false;
        this.initialized = false;
    }

    update(options) {
        if (typeof options === 'object') {
            Object.keys(options).forEach(prop => {
                if (this.options.hasOwnProperty(prop) && this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                    this.hasUpdate = true;
                }
            }, this);

            this.initialized = true;
        }

        return this.hasUpdate;
    }

    toString() {
        return this.name + '' + this.id;
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options
        };
    }
}

module.exports = Display;