import React from 'react';
import classNames from 'classnames';

import { events } from 'core/Global';
import UIPureComponent from 'components/UIPureComponent';
import Icon from 'components/interface/Icon';
import { clamp } from 'util/math';
import iconDots from 'svg/icons/dots-three-horizontal.svg';

export default class Splitter extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            resizing: false
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
        if (this.state.resizing) {
            let { startY, startX, startWidth, startHeight } = this.state,
                { type, panel } = this.props,
                { width, height, minWidth, minHeight, maxWidth, maxHeight } = panel.getSize();

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
    }

    startResize(e) {
        let { panel } = this.props,
            { width, height } = panel.getSize();

        this.setState({
            resizing: true,
            startX: e.pageX,
            startY: e.pageY,
            startWidth: width,
            startHeight: height
        });
    }

    endResize() {
        if (this.state.resizing) {
            this.setState({ resizing: false });
        }
    }

    render() {
        let { type } = this.props,
            classes = {
                splitter: true,
                vertical: type === 'vertical',
                horizontal: type !== 'vertical'
            };

        return (
            <div
                className={classNames(classes)}
                onMouseDown={this.startResize}>
                <Icon className="grip" glyph={iconDots} />
            </div>
        );
    }
}

Splitter.defaultProps = {
    type: 'horizontal'
};