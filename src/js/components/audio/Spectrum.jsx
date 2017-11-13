import React from 'react';

import SpectrumParser from 'audio/SpectrumParser';
import CanvasBars from 'canvas/CanvasBars';
import { fftSize, sampleRate } from 'config/system.json';

export default class Spectrum extends React.PureComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            fftSize: fftSize,
            sampleRate: sampleRate,
            smoothingTimeConstant: 0.5,
            minDecibels: -60,
            maxDecibels: -20,
            minFrequency: 0,
            maxFrequency: 10000,
            normalize: false,
            bins: 32
        };

        this.canvas = null;
    }

    componentDidMount() {
        this.bars = new CanvasBars(
            this.props,
            this.canvas
        );

        this.parser = new SpectrumParser(this.state);
    }

    onClick = () => {
        this.setState(prevState => ({ normalize: !prevState.normalize }), () => {
            this.parser.update(this.state);
        });
    };

    draw(data) {
        let fft = this.parser.parseFFT(data.fft);

        this.bars.render(fft);
    }

    render() {
        return (
            <div className="spectrum">
                <canvas
                    ref={el => this.canvas = el}
                    className="canvas"
                    width={this.props.width}
                    height={this.props.height}
                    onClick={this.onClick}
                />
            </div>
        );
    }
}

Spectrum.defaultProps = {
    width: 854,
    height: 50,
    barWidth: -1,
    barSpacing: 1,
    shadowHeight: 0,
    minHeight: 1,
    color: '#775FD8',
    backgroundColor: '#FF0000'
};