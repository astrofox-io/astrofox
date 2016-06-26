'use strict';

const React = require('react');

class PanelDock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: true,
            dragging: false,
            activePanel: null
        };
    }

    handleDragStart(panel) {
        this.setState({ dragging: true, activePanel: panel });
    }

    handleDragEnd() {
        this.setState({ dragging: false });
    }

    handleMouseMove(e) {
        this.state.activePanel.handleMouseMove(e);
    }

    render() {
        var props = this.props,
            state = this.state,
            classes = 'panel-dock',
            style = {
                width: props.width,
                cursor: (state.dragging) ? 'ns-resize' : null
            },
            mouseMove = (state.dragging) ? this.handleMouseMove.bind(this) : null;

        classes += (props.direction == 'vertical') ? ' flex-column' : ' flex-row';

        if (!props.visible) {
            style.display = 'none';
        }

        var panels = React.Children.map(props.children, function(child) {
            if (child.props.resizable) {
                return React.cloneElement(
                    child,
                    {
                        onDragStart: this.handleDragStart.bind(this),
                        onDragEnd: this.handleDragEnd.bind(this)
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