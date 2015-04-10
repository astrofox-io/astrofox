'use strict';

var _ = require('lodash');

var Class = {
    extend: function(child, base, props) {
        child.prototype = _.create(base.prototype, _.assign({
            _super: base.prototype,
            constructor: child
        }, props));

        return child;
    }
};

module.exports = Class;