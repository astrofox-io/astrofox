import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import Icon from 'components/interface/Icon';
import iconEdit from 'svg/icons/gear.svg';
import iconReact from 'svg/icons/flash.svg';
import styles from './ReactorInput.less';

export default class ReactorInput extends PureComponent {
    static defaultProps = {
        width: 100,
        height: 10,
        color: '#775fd8',
    }

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
        return display.reactors && display.reactors[name];
    }

    toggleReactor = () => {
        const {
            display, name, min, max,
        } = this.props;

        const reactor = display.setReactor(
            name,
            {
                lastValue: display.options[name],
                min: min || 0,
                max: max || 1,
            },
        );

        if (reactor) {
            events.on('render', this.draw, this);
        }
        else {
            events.off('render', this.draw, this);
        }

        this.showReactorControl();
        this.forceUpdate();
    }

    showReactorControl = () => {
        events.emit('reactor-edit', this.getReactor());
    }

    draw = () => {
        const reactor = this.getReactor();

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
        const reactor = this.getReactor();

        return (
            <Fragment>
                <Icon
                    className={classNames({
                        [styles.icon]: true,
                        [styles.iconActive]: reactor,
                    })}
                    glyph={iconReact}
                    title={reactor ? 'Disable Reactor' : 'Enable Reactor'}
                    onClick={this.toggleReactor}
                />
                <div className={classNames({
                    [styles.reactor]: true,
                    [styles.hidden]: !reactor,
                })}
                >
                    <div
                        className={styles.meter}
                        onDoubleClick={this.showReactorControl}
                    >
                        <canvas
                            ref={e => (this.canvas = e)}
                            className="canvas"
                            width={width}
                            height={height}
                        />
                    </div>
                    <Icon
                        className={styles.editIcon}
                        glyph={iconEdit}
                        title="Edit Reactor"
                        onClick={this.showReactorControl}
                    />
                </div>
                {
                    !reactor && children
                }
            </Fragment>
        );
    }
}
