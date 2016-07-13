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
        const props = this.props;

        const activeIndex = this.state.activeIndex;

        const menu = props.tabs.map((item, index) => {
            return (
                <div key={index}
                     className={classNames({ 'tab': true, 'tab-active': index === activeIndex })}
                     onClick={this.onTabClick.bind(this, index)}>
                    {item}
                </div>
            );
        });

        const content = React.Children.map(props.children, (item, index) => {
            return (
                <div style={{ display: (index !== activeIndex) ? 'none' : null }}>
                    {item}
                </div>
            );
        });

        const panelClass = classNames({
            'tab-panel': true,
            'tab-position-left': props.tabPosition === 'left',
            'tab-position-right': props.tabPosition === 'right',
            'tab-position-top': props.tabPosition === 'top',
            'tab-position-bottom': props.tabPosition === 'bottom'
        });

        const tabClass = classNames({
            'tabs': true,
            'tabs-horizontal': props.tabPosition === 'top' || props.tabPosition === 'bottom'
        });

        return (
            <div className={panelClass}>
                <div className={tabClass}>
                    {menu}
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