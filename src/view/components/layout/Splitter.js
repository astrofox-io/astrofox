import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import withMouseEvents from 'components/hocs/withMouseEvents';
import { clamp } from 'utils/math';
import iconDots from 'assets/icons/dots-three-horizontal.svg';
import styles from './Splitter.less';

class Splitter extends PureComponent {
  static defaultProps = {
    type: 'horizontal',
  };

  state = {
    resizing: false,
    startY: 0,
    startX: 0,
    startWidth: 0,
    startHeight: 0,
  };

  componentDidMount() {
    this.props.mouseUp(this.endResize, true);
  }

  componentWillUnmount() {
    const { mouseMove, mouseUp } = this.props;

    mouseMove(this.handleMouseMove, false);
    mouseUp(this.endResize, false);
  }

  handleMouseMove = e => {
    const { resizing, startY, startX, startWidth, startHeight } = this.state;

    if (resizing) {
      const { type, panel } = this.props;

      const { width, height, minWidth, minHeight, maxWidth, maxHeight } = panel.getSize();

      let newWidth = width;
      let newHeight = height;

      switch (type) {
        case 'horizontal':
          newHeight = clamp(startHeight + e.pageY - startY, minHeight, maxHeight);
          break;

        case 'vertical':
          newWidth = clamp(startWidth + e.pageX - startX, minWidth, maxWidth);
          break;
      }

      panel.setSize(newWidth, newHeight);
    }
  };

  startResize = e => {
    const { panel, mouseMove } = this.props;
    const { width, height } = panel.getSize();

    this.setState({
      resizing: true,
      startX: e.pageX,
      startY: e.pageY,
      startWidth: width,
      startHeight: height,
    });

    mouseMove(this.handleMouseMove, true);
  };

  endResize = () => {
    this.setState({ resizing: false });

    this.props.mouseMove(this.handleMouseMove, false);
  };

  render() {
    const { type } = this.props;

    return (
      <div
        className={classNames({
          [styles.splitter]: true,
          [styles.vertical]: type === 'vertical',
          [styles.horizontal]: type !== 'vertical',
        })}
        onMouseDown={this.startResize}
      >
        <Icon className={styles.grip} glyph={iconDots} />
      </div>
    );
  }
}

export default withMouseEvents(Splitter);
