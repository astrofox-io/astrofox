import React from 'react';
import classNames from 'classnames';

import UIPureComponent from '../UIPureComponent';
import { events } from '../../core/Global';
import Splitter from './Splitter';

export default class Panel extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible,
            dragging: false,
            height: props.height,
            width: props.width,
            minHeight: props.minHeight,
            minWidth: props.minWidth,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0
        };
    }

    componentDidMount() {
        events.on('mouseup', this.checkDragState);
    }

    componentWillUnmount() {
        events.off('mouseup', this.checkDragState);
    }

    onStartDrag(e) {
        let props = this.props,
            state = this.state;

        this.setState({
            dragging: true,
            startX: e.pageX,
            startY: e.pageY,
            startWidth: state.width,
            startHeight: state.height
        }, () => {
            if (props.onDragStart) {
                props.onDragStart(this);
            }
        });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove(e) {
        let val,
            state = this.state;

        if (state.dragging) {
            val = state.startHeight + e.pageY - state.startY;
            if (val < state.minHeight) {
                val = state.minHeight;
            }

            this.setState({ height: val });
        }

        e.stopPropagation();
        e.preventDefault();
    }

    checkDragState() {
        if (this.state.dragging) {
            this.setState({ dragging: false }, this.props.onDragEnd);
        }
    }

    render() {
        let splitter,
            { height } = this.state,
            { title, children, direction, stretch, resizable, className } = this.props,
            style = (height) ? { height: height } : null,
            classes = {
                'panel': true,
                'vertical': (direction === 'vertical'),
                'horizontal': (direction !== 'vertical'),
                'stretch': stretch
            };

        if (resizable) {
            splitter = <Splitter type="horizontal" onDragStart={this.onStartDrag} />;
        }

        return (
            <div className={classNames(classes, className)} style={style}>
                <div className="title">{title}</div>
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