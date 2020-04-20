import React, { PureComponent } from 'react';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'view/global';
import Icon from 'components/interface/Icon';
import { Flash, Times } from 'view/icons';
import styles from './ReactorInput.less';

export default class ReactorInput extends PureComponent {
  static defaultProps = {
    width: 100,
    height: 10,
    color: '#775fd8',
    onChange: () => {},
  };

  componentDidMount() {
    const { width, height, color } = this.props;
    const reactor = this.getReactor();

    this.meter = new CanvasMeter(
      {
        width,
        height,
        color,
      },
      this.canvas,
    );

    events.emit('reactor-edit', this.getReactor());

    if (reactor) {
      events.on('render', this.draw, this);
    }
  }

  componentWillUnmount() {
    events.off('render', this.draw, this);
    events.emit('reactor-edit', null);
  }

  getReactor = () => {
    const { display, name } = this.props;

    return display.getReactor(name);
  };

  toggleReactor = () => {
    const reactor = this.getReactor();

    if (reactor) {
      this.showReactorControl(reactor);
    } else {
      this.addReactor();
    }
  };

  addReactor = () => {
    const { display, name, min, max } = this.props;

    const reactor = display.setReactor(name, {
      lastValue: display.properties[name],
      min: min || 0,
      max: max || 1,
    });

    this.showReactorControl(reactor);

    events.on('render', this.draw, this);

    this.forceUpdate();
  };

  removeReactor = () => {
    const { display, name } = this.props;

    display.setReactor(name, null);

    this.showReactorControl(null);

    events.off('render', this.draw, this);

    this.forceUpdate();
  };

  showReactorControl = reactor => {
    events.emit('reactor-edit', reactor);
  };

  draw = () => {
    const reactor = this.getReactor();

    if (reactor) {
      const { output } = reactor.getResult();
      this.meter.render(output);
    }
  };

  render() {
    const { width, height, children } = this.props;

    const reactor = this.getReactor();

    return (
      <>
        <Icon
          className={classNames({
            [styles.icon]: true,
            [styles.iconActive]: reactor,
          })}
          glyph={Flash}
          title={reactor ? 'Show Reactor' : 'Enable Reactor'}
          onClick={this.toggleReactor}
        />
        <div
          className={classNames({
            [styles.reactor]: true,
            [styles.hidden]: !reactor,
          })}
        >
          <div className={styles.meter} onDoubleClick={this.toggleReactor}>
            <canvas ref={e => (this.canvas = e)} className="canvas" width={width} height={height} />
          </div>
          <Icon
            className={styles.closeIcon}
            glyph={Times}
            title="Disable Reactor"
            onClick={this.removeReactor}
          />
        </div>
        {!reactor && children}
      </>
    );
  }
}
