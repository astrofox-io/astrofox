'use strict';

var Base = function() {};

Base.extend = function(props) {
    var base = this,
        prototype = this.prototype,
        props = props || {},
        obj = Object.create(prototype);

    for (var key in props) {
        obj[key] = props[key];
    }

    var constructor = obj.hasOwnProperty('constructor') ?
        obj.constructor :
        function() { base.apply(this, arguments); };

    constructor.prototype = obj;
    obj.constructor = constructor;
    constructor.extend = Base.extend;

    return constructor;
};

module.exports = Base;