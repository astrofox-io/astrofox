'use strict';

const React = require('react');
const { autoBind } = require('../util/object.js');

class UIComponent extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }
}

module.exports = UIComponent;