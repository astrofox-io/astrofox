import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';
import AudioReactor from 'audio/AudioReactor';
import CanvasBars from 'canvas/CanvasBars';
import Panel from 'components/layout/Panel';
import NumberInput from 'components/inputs/NumberInput';
import ButtonInput from 'components/inputs/ButtonInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import DualRangeInput from 'components/inputs/DualRangeInput';
import ToggleInput from 'components/inputs/ToggleInput';
import ButtonGroup from 'components/inputs/ButtonGroup';
import { Control, Row } from 'components/controls/Control';
import { events } from 'core/Global';

const MIN_FREQUENCY = 0;
const MAX_FREQUENCY = 4200;
const MIN_DECIBELS = -60;
const BARS = AudioReactor.maxBins;

export default class Reactor extends UIPureComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;

        this.state = Object.assign({}, AudioReactor.defaults, AudioReactor.parserDefaults);

        this.spectrum = null;
        this.output = null;
    }

    componentDidMount() {
        this.spectrum = new CanvasBars(
            {
                width: BARS * 9,
                height: 150,
                barWidth: 8,
                barSpacing: 1,
                shadowHeight: 0,
                color: '#775FD8',
                backgroundColor: '#FF0000'
            },
            this.spectrumCanvas
        );

        this.output = new CanvasBars(
            {
                width: 20,
                height: 150,
                barWidth: 20,
                barSpacing: 0,
                shadowHeight: 0,
                color: '#9a88e2',
                backgroundColor: '#FF0000'
            },
            this.outputCanvas
        );

        this.reactor = new AudioReactor(this.state);

        events.on('render', data => {
            this.draw(data);
        });
    }

    draw(data) {
        let { fft, output } = this.reactor.parse(data.fft);

        this.spectrum.render(fft);

        this.output.render([output]);
    }

    onChange(name, value) {
        let obj = { [name] : value };

        if (name === 'frequencyRange') {
            let { start, end } = value;
            obj = { minFrequency: start, maxFrequency: end };
        }

        this.reactor.update(obj);

        this.setState(obj);
    }

    onFrequencyChange(val) {
        return () => {
            let obj = {frequencyRange: val};

            this.reactor.update(obj);

            this.setState(obj);
        };
    }

    getOverlayStyle() {
        let { start, end } = this.state.frequencySelection,
            width = (end - start) * 11,
            left = (start * 11) + 1;

        return {
            left: left + 'px',
            width: width + 'px',
            height: '150px'
        };
    }

    render() {
        let minRange = AudioReactor.frequencyRange,
            { maxDecibels, minFrequency, maxFrequency, smoothingTimeConstant, frequencySelection, frequencyRange } = this.state;

        let classes = {
            'reactor': true,
            'display-none': false //!this.props.visible
        };

        return (
            <Panel title="REACTORS" className="reactor-panel">
                <div className="controls">
                    <Control label="REACTOR">
                        <Row>
                            <div className="reactor-visual">
                                <canvas
                                    ref={el => this.spectrumCanvas = el}
                                    className="canvas spectrum-canvas"
                                    width={BARS * 11}
                                    height={150}
                                    onClick={this.onClick}
                                />
                                <canvas
                                    ref={el => this.outputCanvas = el}
                                    className="canvas output-canvas"
                                    width={this.props.width}
                                    height={this.props.height}
                                    onClick={this.onClick}
                                />
                                <div className="reactor-selection-overlay" style={this.getOverlayStyle()} />
                            </div>
                        </Row>
                        <Row label="Max dB">
                            <NumberInput
                                name="maxDecibels"
                                value={maxDecibels}
                                width={40}
                                min={MIN_DECIBELS}
                                max={0}
                                step={1}
                                onChange={this.onChange}
                            />
                            <RangeInput
                                name="maxDecibels"
                                value={maxDecibels}
                                min={MIN_DECIBELS}
                                max={0}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Min Frequency">
                            <NumberInput
                                name="minFrequency"
                                value={minFrequency}
                                width={40}
                                min={0}
                                max={maxFrequency - minRange}
                                step={1}
                                onChange={this.onChange}
                            />
                            <RangeInput
                                name="minFrequency"
                                value={minFrequency}
                                min={MIN_FREQUENCY}
                                max={MAX_FREQUENCY}
                                step={1}
                                upperLimit={maxFrequency - minRange}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Max Frequency">
                            <NumberInput
                                name="maxFrequency"
                                value={maxFrequency}
                                width={40}
                                min={minFrequency + minRange}
                                max={MAX_FREQUENCY}
                                step={1}
                                onChange={this.onChange}
                            />
                            <RangeInput
                                name="maxFrequency"
                                value={maxFrequency}
                                min={MIN_FREQUENCY}
                                max={MAX_FREQUENCY}
                                step={1}
                                lowerLimit={minFrequency + minRange}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Smoothing">
                            <NumberInput
                                name="smoothingTimeConstant"
                                value={smoothingTimeConstant}
                                width={40}
                                min={0}
                                max={0.99}
                                step={0.01}
                                onChange={this.onChange}
                            />
                            <div className="input flex">
                                <RangeInput
                                    name="smoothingTimeConstant"
                                    value={smoothingTimeConstant}
                                    min={0}
                                    max={0.99}
                                    step={0.01}
                                    onChange={this.onChange}
                                />
                            </div>
                        </Row>
                        <Row label="Range">
                            <div className="input flex">
                                <DualRangeInput
                                    name="frequencyRange"
                                    start={minFrequency}
                                    end={maxFrequency}
                                    min={MIN_FREQUENCY}
                                    max={MAX_FREQUENCY}
                                    minRange={minRange}
                                    allowClick={true}
                                    onChange={this.onChange}
                                />
                            </div>
                        </Row>
                        <Row label="Selection">
                            <div className="input flex">
                                <DualRangeInput
                                    name="frequencySelection"
                                    start={frequencySelection.start}
                                    end={frequencySelection.end}
                                    min={0}
                                    max={BARS}
                                    minRange={1}
                                    allowClick={true}
                                    onChange={this.onChange}
                                />
                            </div>
                        </Row>
                    </Control>
                </div>
                <div className="panel-buttons">
                    <ButtonInput icon="icon-plus" title="Add Reactor" onClick={this.onAddClick} />
                    <ButtonInput icon="icon-trash-empty" title="Delete Reactor" onClick={this.onRemoveClick} />
                </div>
            </Panel>
        );
    }
}

Reactor.defaultProps = {

};

Reactor.contextTypes = {
    app: propTypes.object
};