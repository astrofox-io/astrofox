import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';

export class TabPanel extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeIndex: props.activeIndex
        };
    }

    onTabClick(index) {
        this.setState({ activeIndex: index });
    }

    render() {
        const props = this.props,
            activeIndex = this.state.activeIndex,
            tabs = [],
            content = [];

        const panelClasses = {
            'tab-panel': true,
            'tab-position-left': props.tabPosition === 'left',
            'tab-position-right': props.tabPosition === 'right',
            'tab-position-top': props.tabPosition === 'top',
            'tab-position-bottom': props.tabPosition === 'bottom'
        };

        const tabsClass = {
            'tabs': true,
            'tabs-horizontal': props.tabPosition === 'top' || props.tabPosition === 'bottom'
        };

        // Generate tabs and content
        React.Children.map(props.children, (child, index) => {
            const tabClasses = {
                'tab': true,
                'tab-active': index === activeIndex
            };

            tabs.push(
                <div
                    key={index}
                    className={classNames(tabClasses, child.props.className)}
                    onClick={this.onTabClick.bind(this, index)}>
                    {child.props.name}
                </div>
            );

            content.push(
                React.cloneElement(
                    child,
                    {
                        key: index,
                        className: child.props.contentClassName,
                        visible: index === activeIndex
                    }
                )
            );
        });

        return (
            <div id={props.id} className={classNames(panelClasses, props.className)}>
                <div className={classNames(tabsClass)}>
                    {tabs}
                </div>
                <div className={classNames('tab-content', props.contentClassName)}>
                    {content}
                </div>
            </div>
        );
    }
}

TabPanel.defaultProps = {
    tabPosition: 'top'
};

export const Tab = (props) => {
    let style = (props.visible) ? null : {display: 'none'};

    return (
        <div className={props.className} style={style}>
            {props.children}
        </div>
    );
};
