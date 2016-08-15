'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const { Events } = require('../../core/Global.js');
const SpectrumParser = require('../../audio/SpectrumParser.js');
const Bar = require('../../canvas/Bar.js');
const autoBind = require('../../util/autoBind.js');

class Spectrum extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
        
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
        this.bars = new Bar(
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