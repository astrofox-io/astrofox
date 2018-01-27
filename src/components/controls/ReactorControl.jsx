import React from 'react';
import classNames from 'classnames';

import CanvasBars from 'canvas/CanvasBars';
import CanvasMeter from 'canvas/CanvasMeter';
import { events } from 'core/Global';

import { Control, Option } from 'components/controls/Control';
import BoxInput from 'components/inputs/BoxInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import ButtonInput from 'components/inputs/ButtonInput';
import ButtonGroup from 'components/inputs/ButtonGroup';

import iconLeft from 'svg/icons/chevron-left.svg';
import iconRight from 'svg/icons/chevron-right.svg';
import iconMinus from 'svg/icons/minus.svg';
import iconPlus from 'svg/icons/plus.svg';
import iconCircle from 'svg/icons/dots-three-horizontal.svg';

const REACTOR_BARS = 64;

const OUTPUT_MODES = [
    { title: 'Backwards', icon: iconLeft },
    { title: 'Forward', icon: iconRight },
    { title: 'Cycle Backwards', icon: iconMinus },
    { title: 'Cycle Forward', icon: iconPlus },
    { title: 'Cycle', icon: iconCircle }
];

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

    draw = () => {
        const { reactor } = this.props;

        if (reactor) {
            let {fft, output} = reactor.getResult();

            this.spectrum.render(fft);
            this.output.render(output);
        }
    };

    updateReactor = (name, value) => {
        let {reactor, barWidth, barHeight, barSpacing} = this.props,
            obj = { [name]: value };

        if (name === 'selection') {
            const {x, y, width, height} = value,
                maxWidth = REACTOR_BARS * (barWidth + barSpacing),
                maxHeight = barHeight;

            obj.range = {
                x1: x / maxWidth,
                x2: (x + width) / maxWidth,
                y1: y / maxHeight,
                y2: (y + height) / maxHeight
            };
        }

        reactor.update(obj);

        this.forceUpdate();
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
            { outputMode } = (reactor ? reactor.options : {});

        const classes = {
            'reactor': true,
            'display-none': !visible
        };

        const title = reactor ? reactor.label.map((n, i) => <span key={i}>{n}</span>) : null;

        const modeButtons = (
            <ButtonGroup>
                {OUTPUT_MODES.map((mode, index) => {
                    return (
                        <ButtonInput
                            key={index}
                            icon={mode.icon}
                            title={mode.title}
                            active={outputMode === mode.title}
                            onClick={() => this.updateReactor('outputMode', mode.title)}
                        />
                    );
                })}
            </ButtonGroup>
        );

        return (
            <div className={classNames(classes)}>
                <div className="reactor-title">{title}</div>
                <div className="reactor-display">
                    <div className="reactor-controls">
                        <Control>
                            <Option label="Output Mode">
                                {modeButtons}
                            </Option>
                            <Option label="Max dB">
                                <NumberInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    width={40}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    onChange={this.updateParser}
                                />
                                <RangeInput
                                    name="maxDecibels"
                                    value={maxDecibels}
                                    min={-40}
                                    max={0}
                                    step={1}
                                    onChange={this.updateParser}
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
                                    onChange={this.updateParser}
                                />
                                <RangeInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    onChange={this.updateParser}
                                />
                            </Option>
                        </Control>
                    </div>
                    <div className="reactor-spectrum">
                        <canvas
                            ref={e => this.spectrumCanvas = e}
                            width={REACTOR_BARS * (barWidth + barSpacing)}
                            height={barHeight}
                            onClick={this.onClick}
                        />
                        <BoxInput
                            ref={e => this.box = e}
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
                            ref={e => this.outputCanvas = e}
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