import React, { PureComponent } from 'react';
import { events } from 'core/Global';
import { clamp } from 'utils/math.js';
import styles from './BoxInput.less';

export default class BoxInput extends PureComponent {
    static defaultProps = {
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
    }

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

    componentWillReceiveProps({ value }) {
        if (value !== undefined) {
            this.setState({ value });
        }
    }

    onMouseMove = (e) => {
        const {
            resizing,
            value,
            position,
            startX,
            startY,
            startWidth,
            startHeight,
            startTop,
            startLeft
        } = this.state;

        if (resizing) {
            const { minWidth, minHeight, maxWidth, maxHeight, name, onChange } = this.props;

            let dx = e.pageX - startX,
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

            this.setState({ value: newValue });

            if (onChange) {
                onChange(name, newValue);
            }
        }
    };

    startResize = (pos) => (e) => {
        e.stopPropagation();
        e.preventDefault();

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
    };

    endResize = () => {
        this.setState({ resizing: false });
    };

    render() {
        const { x, y, width, height } = this.state.value;

        return (
            <div
                className={styles.box}
                style={{width, height, top: y, left: x}}
            >
                <div
                    className={styles.center}
                    onMouseDown={this.startResize('center')}
                />
                <div
                    className={styles.top}
                    onMouseDown={this.startResize('top')}
                />
                <div
                    className={styles.right}
                    onMouseDown={this.startResize('right')}
                />
                <div
                    className={styles.bottom}
                    onMouseDown={this.startResize('bottom')}
                />
                <div
                    className={styles.left}
                    onMouseDown={this.startResize('left')}
                />
            </div>
        );
    }
}
