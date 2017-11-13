import React from 'react';
import classNames from 'classnames';

import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';

import { Control, Option } from 'components/controls/Control';
import BoxInput from 'components/inputs/BoxInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';

const REACTOR_BARS = 64;

export default class ReactorControl extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { barWidth, barHeight, barSpacing } = this.props;

        this.spectrum = new CanvasBars(
            {
                width: REACTOR_BARS * (barWidth + barSpacing),
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

        events.on('render', this.draw, this);
    }

    componentWillUnmount() {
        events.off('render', this.draw, this);
    }

    draw() {
        const { reactor } = this.props;

        if (reactor) {
            let {fft, output} = reactor.getResult();

            this.spectrum.render(fft);
            this.output.render(output);
        }
    }

    updateReactor = (name, value) => {
        const { x, y, width, height } = value,
            { reactor, barWidth, barHeight, barSpacing } = this.props,
            maxWidth = REACTOR_BARS * (barWidth + barSpacing),
            maxHeight = barHeight;

        let range = {
            x1: x / maxWidth,
            x2: (x + width) / maxWidth,
            y1: y / maxHeight,
            y2: (y + height) / maxHeight
        };

        reactor.update({ [name]: value, range: range });
    };

    updateParser = (name, value) => {
        const { reactor } = this.props;

        if (reactor) {
            reactor.parser.update({ [name]: value });
            this.forceUpdate();
        }
    };

    render() {
        const { reactor, barWidth, barHeight, barSpacing, visible } = this.props,
            { maxDecibels, smoothingTimeConstant } = (reactor ? reactor.parser.options : {}),
            classes = {
                'reactor': true,
                'display-none': !visible
            };

        return (
            <div className={classNames(classes)}>
                <div className="reactor-title">{reactor ? reactor.label : 'REACTOR'}</div>
                <div className="reactor-display">
                    <div className="reactor-controls">
                        <Control>
                            <Option label="Max dB">
                                <NumberInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    width={40}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    updateReactor={this.updateParser}
                                />
                                <RangeInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    updateReactor={this.updateParser}
                                />
                            </Option>
                            <Option label="Smoothing">
                                <NumberInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    width={40}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    updateReactor={this.updateParser}
                                />
                                <RangeInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    updateReactor={this.updateParser}
                                />
                            </Option>
                        </Control>
                    </div>
                    <div className="reactor-spectrum">
                        <canvas
                            ref={el => this.spectrumCanvas = el}
                            width={REACTOR_BARS * (barWidth + barSpacing)}
                            height={barHeight}
                            onClick={this.onClick}
                        />
                        <BoxInput
                            ref={el => this.box = el}
                            name="selection"
                            value={reactor ? reactor.options.selection : {}}
                            minWidth={barWidth}
                            minHeight={barWidth}
                            maxWidth={REACTOR_BARS * (barWidth + barSpacing)}
                            maxHeight={barHeight}
                            onChange={this.updateReactor}
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
            </div>
        );
    }
}

ReactorControl.defaultProps = {
    barWidth: 8,
    barHeight: 100,
    barSpacing: 1,
    reactor: null,
    visible: false
};