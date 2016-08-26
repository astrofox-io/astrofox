'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');

class MenuPanel extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            activeIndex: 0
        };
    }

    onTabClick(index) {
        this.setState({ activeIndex: index });
    }

    render() {
        let tabs = this.props.tabs.map((tab, index) => {
            return (
                <div
                    key={index}
                    className={classNames('tab', {'tab-active': this.state.activeIndex == index})}
                    onClick={this.onTabClick.bind(this, index)}>{tab}
                </div>
            );
        });

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
}

module.exports = MenuPanel;