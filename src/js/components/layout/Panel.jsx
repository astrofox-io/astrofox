import React from 'react';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';
import { events } from 'core/Global';
import Splitter from 'components/layout/Splitter';

export default class Panel extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            resizing: false,
            height: props.height,
            width: props.width,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0
        };
    }

    componentDidMount() {
        events.on('mouseup', this.endResize);
    }

    componentWillUnmount() {
        events.off('mouseup', this.endResize);
    }

    startResize(x, y) {
        let props = this.props,
            { width, height } = this.state;

        this.setState({
            resizing: true,
            startX: x,
            startY: y,
            startWidth: width,
            startHeight: height
        }, () => {
            if (props.onResizeStart) {
                props.onResizeStart(this);
            }
        });
    }

    updatePosition(x, y) {
        let val,
            { resizing, startY, startHeight } = this.state,
            { minHeight } = this.props;

        if (resizing) {
            val = startHeight + y - startY;
            if (val < minHeight) {
                val = minHeight;
            }

            this.setState({ height: val });
        }
    }

    endResize() {
        if (this.state.resizing) {
            this.setState({ resizing: false }, this.props.onResizeEnd);
        }
    }

    render() {
        let splitter, text,
            { height } = this.state,
            { title, children, direction, stretch, resizable, className } = this.props,
            style = (height) ? { height } : null,
            classes = {
                'panel': true,
                'vertical': (direction === 'vertical'),
                'horizontal': (direction !== 'vertical'),
                'stretch': stretch
            };

        if (resizable) {
            splitter = <Splitter type="horizontal" onResize={this.startResize} />;
        }

        if (title) {
            text = <div className="title">{title}</div>;
        }

        return (
            <div className={classNames(classes, className)} style={style}>
                {text}
                {children}
                {splitter}
            </div>
        );
    }
}

Panel.defaultProps = {
    direction: 'vertical',
    stretch: false,
    visible: true,
    height: null,
    width: null,
    minHeight: 0,
    minWidth: 0,
    onDragStart: null,
    onDragEnd: null
};