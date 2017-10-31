import React from 'react';
import classNames from 'classnames';

import { events } from 'core/Global';
import UIPureComponent from 'components/UIPureComponent';
import SpectrumParser from 'audio/SpectrumParser';
import CanvasBars from 'canvas/CanvasBars';
import { ButtonInput } from 'lib/inputs';
import { fftSize, sampleRate } from 'config/system.json';

const BARS = 64;

const parserDefaults = {
    fftSize: fftSize,
    sampleRate: sampleRate,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -12,
    minFrequency: 0,
    maxFrequency: Math.ceil(sampleRate/fftSize * BARS),
    normalize: true,
    bins: BARS
};

export default class AudioAnalyzer extends UIPureComponent {
    constructor(props) {
        super(props);

        this.parser = new SpectrumParser(parserDefaults);

        this.spectrum = null;
    }

    componentDidMount() {
        let { barWidth, barHeight, barSpacing } = this.props;

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
            this.canvas
        );

        events.on('render', data => {
            this.draw(data);
        });
    }

    draw(data) {
        let fft = this.parser.parseFFT(data.fft);

        this.spectrum.render(fft);
    }

    render() {
        const { barWidth, barHeight, barSpacing, visible, reactor } = this.props,
            classes = {
                'analyzer': true,
                'display-none': !visible
            };

        let text = reactor ? 'REACTOR ' + reactor.id : 'nothing';

        return (
            <div className={classNames(classes)}>
                <div className="analyzer-spectrum">
                    <div>{text}</div>
                    <canvas
                        ref={el => this.canvas = el}
                        className="canvas spectrum-canvas"
                        width={BARS * (barWidth + barSpacing)}
                        height={barHeight}
                        onClick={this.onClick}
                    />
                </div>
            </div>
        );
    }
}

AudioAnalyzer.defaultProps = {
    barWidth: 10,
    barHeight: 100,
    barSpacing: 1
};