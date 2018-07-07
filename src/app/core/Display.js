import Component from 'core/Component';
import AudioReactor from 'audio/AudioReactor';

const displayCount = {};

export default class Display extends Component {
    constructor(type, options) {
        if (displayCount[type.className] === undefined) {
            displayCount[type.className] = 1;
        }

        displayCount[type.className] += 1;

        super({
            displayName: `${type.label} ${displayCount[type.className]}`,
            enabled: true,
            ...type.defaultOptions,
            ...options,
        });

        this.name = type.className;
        this.initialized = !!options;
        this.scene = null;
        this.hasUpdate = false;
        this.changed = false;
        this.reactors = {};
    }

    getReactor(name) {
        return this.reactors[name];
    }

    setReactor(name, options) {
        // Create reactor
        if (options) {
            const { displayName } = this.options;
            this.reactors[name] = new AudioReactor({
                displayName: `Reactor/${displayName}/${name}`,
                ...options,
            });
        }
        // Remove reactor
        else {
            this.update({ [name]: this.reactors[name].options.lastValue });
            delete this.reactors[name];
        }

        return this.reactors[name];
    }

    updateReactors(data) {
        const { reactors } = this;

        Object.keys(reactors).forEach((name) => {
            const reactor = reactors[name];

            if (reactor) {
                const { output } = reactor.parse(data);
                const { min, max } = reactor.options;
                const value = ((max - min) * output) + min;

                this.update({ [name]: value });
            }
        });
    }

    update(options = {}) {
        this.hasUpdate = super.update(options);

        if (!this.changed && this.hasUpdate) {
            this.changed = true;
        }

        return this.hasUpdate;
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options,
            reactors: this.reactors,
        };
    }
}
