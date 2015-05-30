'use strict';

var React = require('react');
var Application = require('../core/Application.js');
var SpectrumParser = require('../audio/SpectrumParser.js');
var BarDisplay = require('../display/BarDisplay.js');

var defaults = {
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: -20,
    minFrequency: 0,
    maxFrequency: 10000,
    fftSize: 2048,
    sampleRate: 44100,
    binSize: 64
};

var Spectrum = React.createClass({
    getInitialState: function() {
        return {
            progress: 0,
            seek: 0
        };
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
            React.findDOMNode(this.refs.canvas),
            this.config
        );

        Application.on('render', function(fft) {
            var data = this.data = SpectrumParser.parseFFT(fft, defaults, this.data);

            this.bars.render(data);
        }, this);
    },

    shouldComponentUpdate: function() {
        return false;
    },

    render: function() {
        return (
            <div className="spectrum">
                <canvas ref="canvas" className="canvas" width="854" height="100"></canvas>
            </div>
        );
    }
});

module.exports = Spectrum;