'use strict';

const React = require('react');

const UIComponent = require('../UIComponent.js');

class PanelDock extends UIComponent {
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
            classes = 'panel-dock',
            style = {
                width: props.width,
                cursor: (state.dragging) ? 'ns-resize' : null
            },
            mouseMove = (state.dragging) ? this.onMouseMove.bind(this) : null;

        classes += (props.direction == 'vertical') ? ' flex-column' : ' flex-row';

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
                className={classes}
                style={style}
                onMouseMove={mouseMove}>
                {panels}
            </div>
        )
    }
}

PanelDock.defaultProps = {
    direction: 'vertical',
    width: 320
};

module.exports = PanelDock;