const excluded = ['constructor', 'render'];

module.exports = function(context) {
    Object.getOwnPropertyNames(context.constructor.prototype).forEach(function(func) {
        if (!excluded.includes(func) && typeof this[func] === 'function') {
            this[func] = this[func].bind(this);
        }
    }, context);
};