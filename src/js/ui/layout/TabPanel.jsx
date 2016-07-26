'use strict';

const React = require('react');
const classNames = require('classnames');
const autoBind = require('../../util/autoBind.js');

class TabPanel extends React.Component {
    constructor(props) {
        super(props);

        autoBind(this);

        this.state = {
            activeIndex: 0
        }
    }

    onTabClick(index) {
        this.setState({ activeIndex: index });
    }

    render() {
        const props = this.props,
            activeIndex = this.state.activeIndex,
            tabs = [],
            content = [];

        React.Children.map(props.children, (item, index) => {
            tabs.push(
                <div key={index}
                     className={classNames('tab', {'tab-active': index === activeIndex})}
                     onClick={this.onTabClick.bind(this, index)}>
                    {item.props.name}
                </div>
            );

            content.push(
                React.cloneElement(
                    item,
                    {
                        key: index,
                        className: item.props.className,
                        visible: index === activeIndex
                    }
                )
            );
        });

        const panelClass = {
            'tab-panel': true,
            'tab-position-left': props.tabPosition === 'left',
            'tab-position-right': props.tabPosition === 'right',
            'tab-position-top': props.tabPosition === 'top',
            'tab-position-bottom': props.tabPosition === 'bottom'
        };

        if (props.className) {
            panelClass[props.className] = true;
        }

        const tabClass = {
            'tabs': true,
            'tabs-horizontal': props.tabPosition === 'top' || props.tabPosition === 'bottom'
        };

        return (
            <div className={classNames(panelClass)}>
                <div className={classNames(tabClass)}>
                    {tabs}
                </div>
                <div className="tab-view">
                    {content}
                </div>
            </div>
        );
    }
}

TabPanel.defaultProps = {
    tabPosition: 'top'
};

module.exports = TabPanel;