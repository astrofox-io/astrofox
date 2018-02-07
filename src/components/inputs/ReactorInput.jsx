import React, { PureComponent } from 'react';
import Icon from 'components/interface/Icon';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import editIcon from 'svg/icons/gear.svg';
import styles from './ReactorInput.less';

export default class ReactorInput extends PureComponent {
    static defaultProps = {
        width: 100,
        height: 10,
        color: '#775fd8',
    }

    componentDidMount() {
        let { width, height, color } = this.props;

        this.meter = new CanvasMeter(
            {
                width: width,
                height: height,
                color: color
            },
            this.canvas
        );

        events.on('render', this.draw, this);
        events.emit('reactor-edit', this.props.reactor);
    }

    componentWillUnmount() {
        events.off('render', this.draw, this);
        events.emit('reactor-edit', null);
    }

    showReactorControl = () => {
        events.emit('reactor-edit', this.props.reactor);
    }

    draw = () => {
        const { output } = this.props.reactor.getResult();

        this.meter.render(output);
    }

    render() {
        return (
            <div className={styles.reactor}>
                <div
                    className={styles.meter}
                    onDoubleClick={this.showReactorControl}>
                    <canvas
                        ref={e => this.canvas = e}
                        className="canvas"
                        width={this.props.width}
                        height={this.props.height}
                    />
                </div>
                <Icon
                    className={styles.icon}
                    glyph={editIcon}
                    title="Edit Reactor"
                    onClick={this.showReactorControl}
                />
            </div>
        );
    }
}
