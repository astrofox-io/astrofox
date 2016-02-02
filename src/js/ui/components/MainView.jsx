'use strict';

var React = require('react');

var MainView = React.createClass({
    render: function(){
        return (
            <div className="view">
                {this.props.children}
            </div>
        );
    }
});

module.exports = MainView;