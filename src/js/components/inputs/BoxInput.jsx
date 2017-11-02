import React from 'react';

import UIComponent from 'components/UIComponent';
import { clamp } from 'util/math.js';
import { events } from 'core/Global';

export default class BoxInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            resizing: false,
            width: props.width,
            height: props.height,
            x: props.x,
            y: props.y
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

    onMouseMove(e) {
        let { resizing, position, x, y, width, height, startX, startY, startWidth, startHeight, startTop, startLeft } = this.state,
            { minWidth, minHeight, maxWidth, maxHeight, name, onChange } = this.props;

        if (resizing) {
            const dx = e.pageX - startX,
                dy = e.pageY - startY;

            switch (position) {
                case 'top':
                    y = clamp(startTop + dy, 0, startTop + startHeight - minHeight);
                    height = clamp(startHeight - dy, minHeight, startTop + startHeight);
                    break;
                case 'right':
                    width = clamp(startWidth + dx, minWidth, maxWidth - startLeft);
                    break;
                case 'bottom':
                    height = clamp(startHeight + dy, minHeight, maxHeight - startTop);
                    break;
                case 'left':
                    x = clamp(startLeft + dx, 0, startLeft + startWidth - minWidth);
                    width = clamp(startWidth - dx, minWidth, startLeft + startWidth);
                    break;
                case 'center':
                    x = clamp(startLeft + dx, 0, maxWidth - startWidth);
                    y = clamp(startTop + dy, 0, maxHeight - startHeight);
                    break;
            }

            this.setState({ x, y, width, height });

            if (onChange) {
                onChange(name, { x, y, width, height });
            }
        }
    }

    startResize(pos, e) {
        const { x, y, width, height } = this.state;

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
        const { x, y, width, height } = this.state;

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
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    minWidth: 1,
    minHeight: 1,
    maxWidth: 100,
    maxHeight: 100
};