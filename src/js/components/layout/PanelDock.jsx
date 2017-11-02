import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';

export default class PanelDock extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: true,
            resizing: false,
            activePanel: null
        };
    }

    onResizeStart(panel) {
        this.setState({ resizing: true, activePanel: panel });
    }

    onResizeEnd() {
        this.setState({ resizing: false });
    }

    onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();

        this.state.activePanel.updatePosition(e.pageX, e.pageY);
    }

    render() {
        let props = this.props,
            state = this.state,
            classes = classNames({
                'panel-dock': true,
                'vertical': (props.direction === 'vertical'),
                'horizontal': (props.direction !== 'vertical')
            }),
            style = {
                width: props.width,
                cursor: (state.resizing) ? 'ns-resize' : null
            },
            mouseMove = (state.resizing) ? this.onMouseMove.bind(this) : null;

        if (!props.visible) {
            style.display = 'none';
        }

        let panels = React.Children.map(props.children, child => {
            if (child.props.resizable) {
                return React.cloneElement(
                    child,
                    {
                        onResizeStart: this.onResizeStart,
                        onResizeEnd: this.onResizeEnd
                    }
                );
            }

            return child;
        }, this);

        return (
            <div
                id={props.id}
                className={classes}
                style={style}
                onMouseMove={mouseMove}>
                {panels}
            </div>
        );
    }
}

PanelDock.defaultProps = {
    direction: 'vertical',
    width: 320
};