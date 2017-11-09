import React from 'react';
import classNames from 'classnames';
import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';
import UIPureComponent from 'components/UIPureComponent';
import BoxInput from 'components/inputs/BoxInput';

const BARS = 64;

export default class ReactorControl extends UIPureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { barWidth, barHeight, barSpacing } = this.props;

        this.spectrum = new CanvasBars(
            {
                width: BARS * (barWidth + barSpacing),
                height: barHeight,
                barWidth: barWidth,
                barSpacing: barSpacing,
                shadowHeight: 0,
                color: '#775FD8',
                backgroundColor: '#FF0000'
            },
            this.spectrumCanvas
        );

        this.output = new CanvasMeter(
            {
                width: 20,
                height: barHeight,
                color: '#775FD8',
                origin: 'bottom'
            },
            this.outputCanvas
        );

        events.on('render', this.draw);
    }

    componentWillUnmount() {
        events.off('render', this.draw);
    }

    onChange(name, value) {
        const { x, y, width, height } = value,
            { reactor, barWidth, barHeight, barSpacing } = this.props,
            maxWidth = BARS * (barWidth + barSpacing),
            maxHeight = barHeight;

        let range = {
            x1: x / maxWidth,
            x2: (x + width) / maxWidth,
            y1: y / maxHeight,
            y2: (y + height) / maxHeight
        };

        reactor.update({ [name]: value, range: range });
    }

    draw() {
        const { reactor } = this.props;

        if (reactor) {
            let {fft, output} = reactor.getResult();

            this.spectrum.render(fft);
            this.output.render(output);
        }
    }

    render() {
        const { barWidth, barHeight, barSpacing, visible, reactor } = this.props,
            classes = {
                'reactor': true,
                'display-none': !visible
            };

        let text = reactor ? 'REACTOR ' + reactor.id : 'nothing';

        return (
            <div className={classNames(classes)}>
                <div>{text}</div>
                <div className="reactor-spectrum">
                    <canvas
                        ref={el => this.spectrumCanvas = el}
                        width={BARS * (barWidth + barSpacing)}
                        height={barHeight}
                        onClick={this.onClick}
                    />
                    <BoxInput
                        ref={el => this.box = el}
                        name="selection"
                        value={reactor ? reactor.options.selection : {}}
                        minWidth={barWidth}
                        minHeight={barWidth}
                        maxWidth={BARS * (barWidth + barSpacing)}
                        maxHeight={barHeight}
                        onChange={this.onChange}
                    />
                </div>
                <div className="reactor-output">
                    <canvas
                        ref={el => this.outputCanvas = el}
                        width={20}
                        height={barHeight}
                    />
                </div>
            </div>
        );
    }
}

ReactorControl.defaultProps = {
    barWidth: 10,
    barHeight: 100,
    barSpacing: 1,
    reactor: null,
    visible: false
};