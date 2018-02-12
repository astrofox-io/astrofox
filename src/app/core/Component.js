let id = 0;

export default class Component {
    constructor(options) {
        id += 1;
        Object.defineProperty(this, 'id', { value: id });
        this.options = Object.assign({}, options);
    }

    update(options) {
        let changed = false;

        if (typeof options === 'object') {
            Object.keys(options).forEach((prop) => {
                if (
                    Object.prototype.hasOwnProperty.call(this.options, prop) &&
                    this.options[prop] !== options[prop]
                ) {
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
