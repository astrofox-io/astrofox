'use strict';

var React = require('react');

var Waveform = React.createClass({
    getInitialState: function() {
        return { progress: 0, seek: 0 };
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
        var app = this.props.app,
            FX = app.FX,
            config = this.config,
            player = this.player = app.player;

        this.bars = new FX.BarDisplay(
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

        this.progress = new FX.BarDisplay(
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

        this.overlay = new FX.BarDisplay(
            React.findDOMNode(this.refs.overlay),
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
            this.draw(app.waveform.getData(this.config.bars));
        }.bind(this));

        player.on('time', function(){
            this.forceUpdate();
        }.bind(this));

        player.on('stop', function(){
            this.forceUpdate();
        }.bind(this));

        player.on('seek', function(){
            this.forceUpdate();
        }.bind(this));
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = e.pageX - e.currentTarget.offsetLeft,
            player = this.player;

        player.seek('audio', val / this.config.width);

        this.setState({ progress: val }, function() {
            this.props.onProgressChange(val);
        }.bind(this));
    },

    handleMouseMove: function(e) {
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
        this.overlay.render(data);
    },

    render: function() {
        var width = this.config.width,
            height = this.config.height + this.config.shadowHeight,
            seek = this.state.seek,
            progressWidth = this.props.app.player.getPosition('audio') * width,
            style = { width: progressWidth + 'px' },
            clipStyle = { display: 'none' };

        if (seek > 0) {
            var path = (seek > progressWidth) ?
                this.getClipPath(height, width, seek, progressWidth) :
                this.getClipPath(height, width, progressWidth, seek);

            clipStyle = { WebkitClipPath: path };
        }

        return (
            <div id="waveform">
                <div className="container"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseOut={this.handleMouseOut}>
                    <div className="waveform base">
                        <canvas ref="canvas" width="854" height="100"></canvas>
                    </div>
                    <div className="waveform progress" style={style}>
                        <canvas ref="progress" width="854" height="100"></canvas>
                    </div>
                    <div className="waveform overlay" style={clipStyle}>
                        <canvas ref="overlay" width="854" height="100"></canvas>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Waveform;