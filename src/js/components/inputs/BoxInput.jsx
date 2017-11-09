import React from 'react';

import UIComponent from 'components/UIComponent';
import { clamp } from 'util/math.js';
import { events } from 'core/Global';

export default class BoxInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            resizing: false,
            value: props.value
        };
    }

    componentDidMount() {
        events.on('mouseup', this.endResize);
        events.on('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
        events.off('mouseup', this.endResize);
        events.off('mousemove', this.onMouseMove);
    }

    componentWillReceiveProps(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    }

    onMouseMove(e) {
        if (this.state.resizing) {
            let { value, position, startX, startY, startWidth, startHeight, startTop, startLeft } = this.state,
                { minWidth, minHeight, maxWidth, maxHeight, name, onChange } = this.props,
                dx = e.pageX - startX,
                dy = e.pageY - startY;

            switch (position) {
                case 'top':
                    value.y = clamp(startTop + dy, 0, startTop + startHeight - minHeight);
                    value.height = clamp(startHeight - dy, minHeight, startTop + startHeight);
                    break;
                case 'right':
                    value.width = clamp(startWidth + dx, minWidth, maxWidth - startLeft);
                    break;
                case 'bottom':
                    value.height = clamp(startHeight + dy, minHeight, maxHeight - startTop);
                    break;
                case 'left':
                    value.x = clamp(startLeft + dx, 0, startLeft + startWidth - minWidth);
                    value.width = clamp(startWidth - dx, minWidth, startLeft + startWidth);
                    break;
                case 'center':
                    value.x = clamp(startLeft + dx, 0, maxWidth - startWidth);
                    value.y = clamp(startTop + dy, 0, maxHeight - startHeight);
                    break;
            }

            const newValue = Object.assign({}, value);

            this.setState({ value: newValue});

            if (onChange) {
                onChange(name, newValue);
            }
        }
    }

    startResize(pos, e) {
        const { x, y, width, height } = this.state.value;

        this.setState({
            resizing: true,
            position: pos,
            startX: e.pageX,
            startY: e.pageY,
            startWidth: width,
            startHeight: height,
            startLeft: x,
            startTop: y
        });

        e.stopPropagation();
        e.preventDefault();
    }

    endResize() {
        if (this.state.resizing) {
            this.setState({resizing: false});
        }
    }

    render() {
        const { x, y, width, height } = this.state.value;

        return (
            <div
                className="input-box" style={{width,height,top: y, left: x}}>
                <div
                    className="input-box-center"
                    onMouseDown={this.startResize.bind(this, 'center')}
                />
                <div
                    className="input-box-top"
                    onMouseDown={this.startResize.bind(this, 'top')}
                />
                <div
                    className="input-box-right"
                    onMouseDown={this.startResize.bind(this, 'right')}
                />
                <div
                    className="input-box-bottom"
                    onMouseDown={this.startResize.bind(this, 'bottom')}
                />
                <div
                    className="input-box-left"
                    onMouseDown={this.startResize.bind(this, 'left')}
                />
            </div>
        );
    }
}

BoxInput.defaultProps = {
    name: 'box',
    value: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
    },
    minWidth: 1,
    minHeight: 1,
    maxWidth: 100,
    maxHeight: 100
};