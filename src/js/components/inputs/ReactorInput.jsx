import React from 'react';
import { events } from 'core/Global';

import Icon from 'components/interface/Icon';
import CanvasMeter from 'canvas/CanvasMeter';
import editIcon from 'svg/icons/gear.svg';

export default class ReactorInput extends React.PureComponent {
    constructor(props) {
        super(props);
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
    };

    draw = () => {
        const { output } = this.props.reactor.getResult();

        this.meter.render(output);
    };

    render() {
        return (
            <div className="input-reactor">
                <div
                    className="reactor-meter"
                    onDoubleClick={this.showReactorControl}>
                    <canvas
                        ref={e => this.canvas = e}
                        className="canvas"
                        width={this.props.width}
                        height={this.props.height}
                    />
                </div>
                <Icon
                    className="reactor-edit-icon"
                    glyph={editIcon}
                    title="Edit Reactor"
                    onClick={this.showReactorControl}
                />
            </div>
        );
    }
}

ReactorInput.defaultProps = {
    width: 100,
    height: 10,
    color: '#775fd8',
};