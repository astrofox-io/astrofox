import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';

export default class PanelDock extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: true,
            dragging: false,
            activePanel: null
        };
    }

    onDragStart(panel) {
        this.setState({ dragging: true, activePanel: panel });
    }

    onDragEnd() {
        this.setState({ dragging: false });
    }

    onMouseMove(e) {
        this.state.activePanel.onMouseMove(e);
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
                cursor: (state.dragging) ? 'ns-resize' : null
            },
            mouseMove = (state.dragging) ? this.onMouseMove.bind(this) : null;

        if (!props.visible) {
            style.display = 'none';
        }

        let panels = React.Children.map(props.children, child => {
            if (child.props.resizable) {
                return React.cloneElement(
                    child,
                    {
                        onDragStart: this.onDragStart,
                        onDragEnd: this.onDragEnd
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