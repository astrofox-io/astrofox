'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var Application = require('../../core/Application.js');
var SpectrumParser = require('../../audio/SpectrumParser.js');
var BarDisplay = require('../../display/BarDisplay.js');

var Spectrum = React.createClass({
    defaultState: {
        smoothingTimeConstant: 0.5,
        minDecibels: -60,
        maxDecibels: -12,
        minFrequency: 0,
        maxFrequency: 10000,
        fftSize: 1024,
        sampleRate: 44100,
        binSize: 32,
        normalize: false
    },

    getInitialState: function() {
        return this.defaultState;
    },

    componentWillMount: function() {
        this.config = {
            width: 854,
            height: 100,
            barWidth: -1,
            barSpacing: 1,
            shadowHeight: 0,
            color: '#775fd8'
        };

        this.data = null;
    },

    componentDidMount: function() {
        this.bars = new BarDisplay(
            ReactDOM.findDOMNode(this.refs.canvas),
            this.config
        );

        Application.on('render', function(data) {
            var fft = this.data = SpectrumParser.parseFFT(data.fft, this.state, this.data);

            this.bars.render(fft);
        }, this);
    },

    shouldComponentUpdate: function() {
        return false;
    },

    handleClick: function() {
        this.setState({ normalize: !this.state.normalize });
    },

    render: function() {
        return (
            <div className="spectrum">
                <canvas ref="canvas" className="canvas" width="854" height="100" onClick={this.handleClick}></canvas>
            </div>
        );
    }
});

module.exports = Spectrum;