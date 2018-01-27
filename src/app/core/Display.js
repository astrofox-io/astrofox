import Component from 'core/Component';
import AudioReactor from 'audio/AudioReactor';

const displayCount = {};

export default class Display extends Component {
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
        this.scene = null;
        this.hasUpdate = false;
        this.changed = false;
        this.reactors = {};
    }

    update(options) {
        this.hasUpdate = super.update(options);

        if (!this.changed && this.hasUpdate) {
            this.changed = true;
        }

        return this.hasUpdate;
    }

    setReactor(name, options) {
        const reactor = this.reactors[name];

        if (reactor) {
            this.update({ [name]: reactor.options.lastValue });
            delete this.reactors[name];
        }
        else {
            this.reactors[name] = new AudioReactor(options);
        }
    }

    updateReactors(data) {
        let reactor;
        const { reactors } = this;

        if (reactors) {
            Object.keys(reactors).forEach(name => {
                reactor = reactors[name];
                if (reactor) {
                    const output = (reactor.parse(data)).output,
                        { min, max } = reactor.options,
                        value = ((max - min) * output) + min;

                    this.update({ [name]: value });
                }
            });
        }
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options,
            reactors: this.reactors
        };
    }
}