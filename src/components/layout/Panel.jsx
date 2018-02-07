import React from 'react';
import classNames from 'classnames';
import Splitter from 'components/layout/Splitter';
import styles from './Panel.less';

export default class Panel extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            height: props.height,
            width: props.width
        };
    }

    getSize() {
        const { width, height } = this.state;
        const { minWidth, minHeight, dock } = this.props;
        const rect = dock.domElement.getBoundingClientRect();

        return {
            width,
            height,
            minWidth,
            minHeight,
            maxWidth: rect.width,
            maxHeight: rect.height,
        };
    }

    setSize(width, height) {
        this.setState({ width, height });
    }

    render() {
        const {
            title,
            children,
            direction,
            stretch,
            resizable,
            className
        } = this.props;

        const { height } = this.state;

        const style = height ? { height } : null;

        return (
            <div
                className={
                    classNames({
                        [styles.panel]: true,
                        [styles.vertical]: direction === 'vertical',
                        [styles.horizontal]: direction !== 'vertical',
                        [styles.stretch]: stretch
                    }, className)
                }
                style={style}
            >
                {
                    title &&
                    <div className={styles.title}>{title}</div>
                }
                {children}
                {
                    resizable &&
                    <Splitter type="horizontal" panel={this} />
                }
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
    minWidth: 0
};