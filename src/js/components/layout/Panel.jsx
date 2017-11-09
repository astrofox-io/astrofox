import React from 'react';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';
import Splitter from 'components/layout/Splitter';

export default class Panel extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            height: props.height,
            width: props.width
        };
    }

    getSize() {
        const { width, height } = this.state,
            { minWidth, minHeight, dock } = this.props;

        const rect = dock.domElement.getBoundingClientRect();

        return { width, height, minWidth, minHeight, maxWidth: rect.width, maxHeight: rect.height };
    }

    setSize(width, height) {
        this.setState({ width, height });
    }

    render() {
        let splitter, text,
            { title, children, direction, stretch, resizable, className } = this.props,
            { height } = this.state,
            style = (height) ? { height } : null,
            classes = {
                'panel': true,
                'vertical': (direction === 'vertical'),
                'horizontal': (direction !== 'vertical'),
                'stretch': stretch
            };

        if (resizable) {
            splitter = <Splitter type="horizontal" panel={this} />;
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
    minWidth: 0
};