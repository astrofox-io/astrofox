import React from 'react';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';

export default class PanelDock extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible
        };
    }

    render() {
        const { width, direction, visible, children } = this.props,
            classes = classNames({
                'panel-dock': true,
                'vertical': direction === 'vertical',
                'horizontal': direction !== 'vertical',
                'display-none': !visible
            }),
            style = {
                width: width
            };

        const panels = React.Children.map(children, child => {
            return React.cloneElement(child, { dock: this });
        });

        return (
            <div
                ref={el => this.domElement = el}
                className={classes}
                style={style}>
                {panels}
            </div>
        );
    }
}

PanelDock.defaultProps = {
    direction: 'vertical',
    width: 320,
    visible: true
};