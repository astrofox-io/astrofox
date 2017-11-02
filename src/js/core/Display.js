import Component from 'core/Component';

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
        this.owner = null;
        this.hasUpdate = false;
        this.changed = false;
    }

    update(options) {
        this.hasUpdate = super.update(options);

        if (!this.changed && this.hasUpdate) {
            this.changed = true;
        }

        return this.hasUpdate;
    }

    updateReactors(data) {
        let reactor;
        const { reactors } = this;

        if (reactors) {
            Object.keys(reactors).forEach(name => {
                reactor = reactors[name];
                if (reactor) {
                    reactor.parse(data);
                    this.options[name] = reactor.getResult().output;
                }
            });
        }
    }

    toJSON() {
        return {
            name: this.name,
            options: this.options
        };
    }
}