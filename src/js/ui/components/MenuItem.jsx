'use strict';

var React = require('react');

var MenuItem = React.createClass({
    getDefaultProps: function() {
        return {
            label: '',
            checked: false,
            onClick: function(){}
        };
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick(this);
    },

    render: function() {
        var classes = 'menu-item';

        if (this.props.checked) {
            classes += ' checked';
        }

        return (
            <li className={classes}
                onClick={this.handleClick}>
                {this.props.label}
            </li>
        );
    }
});

module.exports = MenuItem;