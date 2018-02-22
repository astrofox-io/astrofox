import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import Icon from 'components/interface/Icon';
import iconClose from 'svg/icons/times.svg';
import iconReact from 'svg/icons/flash.svg';
import styles from './ReactorInput.less';

export default class ReactorInput extends PureComponent {
    static defaultProps = {
        width: 100,
        height: 10,
        color: '#775fd8',
        onChange: () => {},
    }

    state = {
        reactor: null,
    };

    componentDidMount() {
        const { width, height, color } = this.props;

        this.meter = new CanvasMeter(
            {
                width,
                height,
                color,
            },
            this.canvas,
        );

        events.emit('reactor-edit', this.getReactor());
    }

    componentWillUnmount() {
        events.off('render', this.draw, this);
        events.emit('reactor-edit', null);
    }

    getReactor = () => {
        const { display, name } = this.props;

        return display.getReactor(name);
    }

    toggleReactor = () => {
        const { reactor } = this.state;

        if (reactor) {
            this.showReactorControl(reactor);
        }
        else {
            this.addReactor();
        }
    }

    addReactor = () => {
        const {
            display,
            name,
            min,
            max,
        } = this.props;

        const reactor = display.setReactor(
            name,
            {
                lastValue: display.options[name],
                min: min || 0,
                max: max || 1,
            },
        );

        this.setState({ reactor }, () => {
            this.showReactorControl(reactor);

            events.on('render', this.draw, this);
        });
    }

    removeReactor = () => {
        const {
            display,
            name,
        } = this.props;

        display.setReactor(name, null);

        this.setState({ reactor: null }, () => {
            this.showReactorControl(null);

            events.off('render', this.draw, this);
        });
    }

    showReactorControl = (reactor) => {
        events.emit('reactor-edit', reactor);
    }

    draw = () => {
        const { reactor } = this.state;

        if (reactor) {
            const { output } = reactor.getResult();
            this.meter.render(output);
        }
    }

    render() {
        const {
            width,
            height,
            children,
        } = this.props;

        const { reactor } = this.state;

        return (
            <Fragment>
                <Icon
                    className={classNames({
                        [styles.icon]: true,
                        [styles.iconActive]: reactor,
                    })}
                    glyph={iconReact}
                    title={reactor ? 'Show Reactor' : 'Enable Reactor'}
                    onClick={this.toggleReactor}
                />
                <div className={classNames({
                    [styles.reactor]: true,
                    [styles.hidden]: !reactor,
                })}
                >
                    <div
                        className={styles.meter}
                        onDoubleClick={this.toggleReactor}
                    >
                        <canvas
                            ref={e => (this.canvas = e)}
                            className="canvas"
                            width={width}
                            height={height}
                        />
                    </div>
                    <Icon
                        className={styles.closeIcon}
                        glyph={iconClose}
                        title="Disable Reactor"
                        onClick={this.removeReactor}
                    />
                </div>
                {
                    !reactor && children
                }
            </Fragment>
        );
    }
}
