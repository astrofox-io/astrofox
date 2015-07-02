'use strict';

var _ = require('lodash');

var Shader = function(options) {
    this.options = _.assign({}, options);
};

module.exports = Shader;