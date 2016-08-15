'use strict';

const Component = require('../core/Component.js');

const displayCount = {};

class Display extends Component {
    constructor(type, options) {
        if (typeof displayCount[type.className] === 'undefined') {
            displayCount[type.className] = 1;
        }

        super(
            Object.assign(
                {
                    displayName: type.label + ' ' + displayCount[type.className]++,
                    enabled: true
                },
                type.defaults,
                options
            )
        );

        this.name = type.className;
        this.initialized = !!options;
        this.owner = null;
        this.hasUpdate = false;
    }

    update(options) {
        return this.hasUpdate = super.update(options);
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options
        };
    }
}

module.exports = Display;