import React from 'react';
import { events } from 'core/Global';

import UIPureComponent from 'components/UIPureComponent';
import Icon from 'components/interface/Icon';
import CanvasMeter from 'canvas/CanvasMeter';
import editIcon from 'svg/icons/gear.svg';

export default class ReactorInput extends UIPureComponent {
    constructor(props) {
        super(props);

        this.reactor = props.reactor;
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

        events.on('render', this.draw);
    }

    componentWillUnmount() {
        events.off('render', this.draw);
    }

    onClick() {
        events.emit('reactor-edit', this.reactor);
    }

    draw() {
        let { output } = this.reactor.getResult();

        this.meter.render(output);
    }

    render() {
        return (
            <div className="input-reactor">
                <div className="reactor-meter">
                    <canvas
                        ref={el => this.canvas = el}
                        className="canvas"
                        width={this.props.width}
                        height={this.props.height}
                    />
                </div>
                <Icon
                    className="reactor-edit-icon"
                    glyph={editIcon}
                    onClick={this.onClick}
                />
            </div>
        );
    }
}

ReactorInput.defaultProps = {
    width: 100,
    height: 10,
    color: '#775fd8'
};