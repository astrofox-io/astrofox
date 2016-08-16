'use strict';

let id = 0;

class Component {
    constructor(options) {
        Object.defineProperty(this, 'id', { value: id++ });
        this.options = Object.assign({}, options);
    }

    update(options) {
        let changed = false;

        if (typeof options === 'object') {
            Object.keys(options).forEach(prop => {
                if (this.options.hasOwnProperty(prop) && this.options[prop] !== options[prop]) {
                    this.options[prop] = options[prop];
                    changed = true;
                }
            });
        }

        return changed;
    }

    toString() {
        return this.id.toString();
    }
}

module.exports = Component;