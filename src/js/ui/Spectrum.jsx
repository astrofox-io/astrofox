'use strict';

var React = require('react');
var Application = require('../core/Application.js');
var SpectrumParser = require('../audio/SpectrumParser.js');
var BarDisplay = require('../display/BarDisplay.js');

var Spectrum = React.createClass({
    defaultState: {
        smoothingTimeConstant: 0.5,
        minDecibels: -40,
        maxDecibels: -0,
        minFrequency: 0,
        maxFrequency: 14000,
        fftSize: 1024,
        sampleRate: 44100,
        binSize: 32,
        showMagnitude: false
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
        this.i = 0;
    },

    componentDidMount: function() {
        this.bars = new BarDisplay(
            React.findDOMNode(this.refs.canvas),
            this.config
        );

        Application.on('render', function(fft) {
            var data = this.data = SpectrumParser.parseFFT(fft, this.state, this.data);
            //if (this.i++ % 60 === 0) console.log(data);
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