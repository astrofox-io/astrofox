'use strict';

var React = require('react');

var MenuPanel = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: 0
        }
    },

    handleTabClick: function(index, e) {
        this.setState({ activeIndex: index });
    },

    render: function() {
        var tabs = this.props.tabs.map(function(tab, index) {
            var classes = 'tab';

            if (this.state.activeIndex == index) {
                classes += ' tab-active';
            }

            return <div key={index} className={classes} onClick={this.handleTabClick.bind(this, index)}>{tab}</div>;
        }.bind(this));

        return (
            <div className="menu-panel">
                <div className="nav">
                    {tabs}
                </div>
                <div className="base">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

module.exports = MenuPanel;