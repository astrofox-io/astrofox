'use strict';

var React = require('react');

var PanelDock = React.createClass({
    getDefaultProps: function() {
        return {
            direction: 'vertical',
            width: 320
        };
    },
    getInitialState: function() {
        return {
            visible: true,
            dragging: false,
            activePanel: null
        };
    },

    handleDragStart: function(panel) {
        this.setState({ dragging: true, activePanel: panel });
    },

    handleDragEnd: function() {
        this.setState({ dragging: false });
    },

    handleMouseMove: function(e) {
        this.state.activePanel.handleMouseMove(e);
    },

    render: function() {
        var props = this.props,
            state = this.state,
            classes = 'panel-dock',
            style = {
                width: props.width,
                cursor: (state.dragging) ? 'ns-resize' : null
            },
            mouseMove = (state.dragging) ? this.handleMouseMove : null;

        classes += (props.direction == 'vertical') ? ' flex-column' : ' flex-row';

        if (!props.visible) {
            style.display = 'none';
        }

        var panels = React.Children.map(props.children, function(child) {
            var obj = child.props;

            if (obj.resizable) {
                obj.onDragStart = this.handleDragStart;
                obj.onDragEnd = this.handleDragEnd;

                return React.cloneElement(child, obj);
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
});

module.exports = PanelDock;