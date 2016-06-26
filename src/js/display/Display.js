'use strict';

const defaults = {
    enabled: true
};

var id = 0;

class Display {
    constructor(name, options) {
        this.id = id++;
        this.name = name;
        this.options = Object.assign({displayName: name + '' + id}, defaults, options);
        this.owner = null;
        this.hasUpdate = false;
        this.initialized = false;
    }

    update(options) {
        if (options) {
            for (let prop in options) {
                if (options.hasOwnProperty(prop) && this.options.hasOwnProperty(prop)) {
                    if (this.options[prop] !== options[prop]) {
                        this.options[prop] = options[prop];
                        this.hasUpdate = true;
                    }
                }
            }

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