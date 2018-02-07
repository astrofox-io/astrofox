import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { events } from 'core/Global';
import { clamp } from 'utils/math';
import iconDots from 'svg/icons/dots-three-horizontal.svg';
import styles from './Splitter.less';

export default class Splitter extends PureComponent {
    static defaultProps = {
        type: 'horizontal'
    }

    state = {
        resizing: false,
        startY: 0,
        startX: 0,
        startWidth: 0,
        startHeight: 0,
    }

    componentDidMount() {
        events.on('mouseup', this.endResize, this);
        events.on('mousemove', this.onMouseMove, this);
    }

    componentWillUnmount() {
        events.off('mouseup', this.endResize, this);
        events.off('mousemove', this.onMouseMove, this);
    }

    onMouseMove = (e) => {
        const { resizing, startY, startX, startWidth, startHeight } = this.state;

        if (resizing) {
            const { type, panel } = this.props;
            let {
                width,
                height,
                minWidth,
                minHeight,
                maxWidth,
                maxHeight
            } = panel.getSize();

            switch (type) {
                case 'horizontal':
                    height = clamp(startHeight + e.pageY - startY, minHeight, maxHeight);
                    break;

                case 'vertical':
                    width = clamp(startWidth + e.pageX - startX, minWidth, maxWidth);
                    break;
            }

            panel.setSize(width, height);
        }
    };

    startResize = (e) => {
        const { panel } = this.props;
        const { width, height } = panel.getSize();

        this.setState({
            resizing: true,
            startX: e.pageX,
            startY: e.pageY,
            startWidth: width,
            startHeight: height
        });
    };

    endResize = () => {
        if (this.state.resizing) {
            this.setState({ resizing: false });
        }
    };

    render() {
        const { type } = this.props;

        return (
            <div
                className={
                    classNames({
                        [styles.splitter]: true,
                        [styles.vertical]: type === 'vertical',
                        [styles.horizontal]: type !== 'vertical'
                    })
                }
                onMouseDown={this.startResize}>
                <Icon className={styles.grip} glyph={iconDots} />
            </div>
        );
    }
}
