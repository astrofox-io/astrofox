'use strict';

const React = require('react');
const classNames = require('classnames');

class MenuPanel extends React.Component {
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
                    className={classNames({ 'tab': true, 'tab-active': this.state.activeIndex == index })}
                    onClick={this.onTabClick.bind(this, index)}>{tab}
                </div>
            );
        }, this);

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