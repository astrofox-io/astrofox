'use strict';

var React = require('react');
var Application = require('../core/Application.js');
var BarDisplay = require('../display/BarDisplay.js');
var WaveformParser = require('../audio/WaveformParser.js');

var Waveform = React.createClass({
    getInitialState: function() {
        return {
            progress: 0,
            seek: 0
        };
    },

    componentWillMount: function() {
        this.config = {
            width: 854,
            height: 70,
            barWidth: 3,
            barSpacing: 1,
            shadowHeight: 30,
            bgColor: '#333333',
            bars: 213
        };
    },

    componentDidMount: function() {
        var config = this.config,
            player = Application.player;

        this.bars = new BarDisplay(
            React.findDOMNode(this.refs.canvas),
            {
                y: config.height,
                height: config.height,
                width: config.width,
                barWidth: config.barWidth,
                barSpacing: config.barSpacing,
                color: ['#555555','#444444'],
                shadowHeight: config.shadowHeight,
                shadowColor: '#333333'
            }
        );

        this.progress = new BarDisplay(
            React.findDOMNode(this.refs.progress),
            {
                y: config.height,
                height: config.height,
                width: config.width,
                barWidth: config.barWidth,
                barSpacing: config.barSpacing,
                color: ['#b6aaff','#927fff'],
                shadowHeight: config.shadowHeight,
                shadowColor: '#554b96'
            }
        );

        this.seek = new BarDisplay(
            React.findDOMNode(this.refs.seek),
            {
                y: config.height,
                height: config.height,
                width: config.width,
                barWidth: config.barWidth,
                barSpacing: config.barSpacing,
                color: ['#8880bf','#6c5fbf'],
                shadowHeight: config.shadowHeight,
                shadowColor: '#403972'
            }
        );

        player.on('load', function() {
            var options = { bars: this.config.bars },
                buffer = Application.player.getSound('audio').buffer,
                data = WaveformParser.parseBuffer(buffer, options);

            this.draw(data);
        }, this);

        player.on('tick', function(){
            this.forceUpdate();
        }, this);

        player.on('stop', function(){
            this.forceUpdate();
        }, this);

        player.on('seek', function(){
            this.forceUpdate();
        }, this);
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = e.pageX - e.currentTarget.offsetLeft,
            player = Application.player;

        player.seek('audio', val / this.config.width);

        this.setState({ progress: val });
    },

    handleMouseMove: function(e) {
        if (!Application.player.getSound('audio')) return;

        e.stopPropagation();
        e.preventDefault();

        var val = e.pageX - e.currentTarget.offsetLeft;
        this.setState({ seek: val });
    },

    handleMouseOut: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ seek: 0 });
    },

    getClipPath: function(height, width, start, end) {
        var points = [
            start + 'px 0px',
            end + 'px 0px',
            end + 'px ' + height + 'px',
            start + 'px ' + height + 'px',
            start + 'px 0px'
        ];

        return 'polygon(' + points.join(',') + ')';
    },

    draw: function(data) {
        this.bars.render(data);
        this.progress.render(data);
        this.seek.render(data);
    },

    render: function() {
        var width = this.config.width,
            height = this.config.height + this.config.shadowHeight,
            seek = this.state.seek,
            progressWidth = Application.player.getPosition('audio') * width,
            progressStyle = { width: progressWidth + 'px' },
            clipStyle = { display: 'none' };

        if (seek > 0) {
            var path = (seek > progressWidth) ?
                this.getClipPath(height, width, seek, progressWidth) :
                this.getClipPath(height, width, progressWidth, seek);

            clipStyle = { WebkitClipPath: path };
        }

        return (
            <div className="waveform">
                <div className="container"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseOut={this.handleMouseOut}>
                    <div className="canvas base">
                        <canvas ref="canvas" width="854" height="100"></canvas>
                    </div>
                    <div className="canvas progress" style={progressStyle}>
                        <canvas ref="progress" width="854" height="100"></canvas>
                    </div>
                    <div className="canvas seek" style={clipStyle}>
                        <canvas ref="seek" width="854" height="100"></canvas>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Waveform;