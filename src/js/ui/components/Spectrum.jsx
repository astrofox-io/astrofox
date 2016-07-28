'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const { Events } = require('../../core/Global.js');
const SpectrumParser = require('../../audio/SpectrumParser.js');
const BarDisplay = require('../../display/BarDisplay.js');
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

    componentWillMount() {
        this.config = {
            width: 854,
            height: 100,
            barWidth: -1,
            barSpacing: 1,
            shadowHeight: 0,
            color: '#775fd8'
        };
    }

    componentDidMount() {
        this.bars = new BarDisplay(
            ReactDOM.findDOMNode(this.refs.canvas),
            this.config
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

module.exports = Spectrum;