'use strict';

const React = require('react');

const UIComponent = require('../UIComponent.js');
const { Events } = require('../../core/Global.js');
const SpectrumParser = require('../../audio/SpectrumParser.js');
const CanvasBars = require('../../canvas/CanvasBars.js');

class Spectrum extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            smoothingTimeConstant: 0.5,
            minDecibels: -60,
            maxDecibels: -12,
            minFrequency: 0,
            maxFrequency: 10000,
            fftSize: 1024,
            sampleRate: 44100,
            binSize: 32,
            normalize: false
        };
    }

    componentDidMount() {
        this.bars = new CanvasBars(
            this.props,
            this.refs.canvas
        );

        this.parser = new SpectrumParser(this.state);

        Events.on('render', this.updateCanvas);
    }

    componentWillUnmount() {
        Events.off('render', this.updateCanvas);
    }

    shouldComponentUpdate() {
        return false;
    }

    onClick() {
        this.setState({ normalize: !this.state.normalize }, () => {
            this.parser.update(this.state);
        });
    }

    updateCanvas(data) {
        let fft = this.parser.parseFFT(data.fft);

        this.bars.render(fft);

    }

    render() {
        return (
            <div className="spectrum">
                <canvas ref="canvas" width="854" height="100" onClick={this.onClick} />
            </div>
        );
    }
}

Spectrum.defaultProps = {
    width: 854,
    height: 100,
    barWidth: -1,
    barSpacing: 1,
    shadowHeight: 0,
    color: '#775FD8'
};

module.exports = Spectrum;