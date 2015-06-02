'use strict';

var React = require('react');
var Application = require('../core/Application.js');
var RangeInput = require('./input/RangeInput.jsx');

var Player = React.createClass({
    getDefaultProps: function() {
        return {
            visible: true
        };
    },

    getInitialState: function() {
        return {
            progressPosition: 0
        };
    },

    componentDidMount: function() {
        var player = Application.player;

        player.on('tick', function() {
            if (player.isPlaying()) {
                this.setState({
                    progressPosition: this.refs.progress.getPosition()
                });
            }
        }, this);

        player.on('play', function() {
            this.forceUpdate();
        }, this);

        player.on('pause', function() {
            this.forceUpdate();
        }, this);

        player.on('stop', function() {
            this.setState({ progressPosition: 0 });
        }, this);

        player.on('seek', function() {
            this.setState({
                progressPosition: this.refs.progress.getPosition()
            });
        }, this);
    },

    onPlayButtonClick: function() {
        Application.player.play('audio');
    },

    onStopButtonClick: function() {
        Application.player.stop('audio');
        Application.spectrum.analyzer.disconnect();
        console.log(Application.spectrum.analyzer);
    },

    onLoopButtonClick: function() {
        Application.player.toggleLoop();
        this.forceUpdate();
    },

    onVolumeChange: function(val) {
        Application.player.setVolume(val);
    },

    onProgressChange: function(val) {
        Application.player.seek('audio', val);
    },

    onProgressUpdate: function(val) {
        this.setState({ progressPosition: val });
    },

    render: function() {
        var state = this.state,
            player = Application.player,
            totalTime = player.getDuration('audio'),
            audioPosition = player.getPosition('audio'),
            currentTime = state.progressPosition * totalTime,
            isPlaying = player.isPlaying(),
            loop = player.options.loop,
            style = { display: (this.props.visible) ? 'flex' : 'none' };

        return (
            <div className="player" style={style}>
                <div className="buttons">
                    <PlayButton
                        ref="play"
                        isPlaying={isPlaying}
                        onClick={this.onPlayButtonClick}
                    />
                    <StopButton
                        ref="stop"
                        onClick={this.onStopButtonClick}
                    />
                </div>
                <VolumeControl
                    ref="volume"
                    onChange={this.onVolumeChange}
                />
                <ProgressControl
                    ref="progress"
                    progressPosition={audioPosition}
                    onChange={this.onProgressChange}
                    onUpdate={this.onProgressUpdate}
                    readOnly={totalTime==0}
                />
                <TimeInfo
                    ref="time"
                    currentTime={currentTime}
                    totalTime={totalTime}
                />
                <LoopButton
                    loop={loop}
                    onClick={this.onLoopButtonClick}
                />
            </div>
        );
    }
});

var PlayButton = React.createClass({
    getInitialState: function() {
        return { playing: false };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.isPlaying !== 'undefined') {
            this.setState({ playing: props.isPlaying });
        }
    },

    render: function() {
        var classes = this.state.playing ? 'icon-pause' : 'icon-play';

        return (
            <div className="button play-button"
                ref="button"
                onClick={this.props.onClick}>
                <i className={classes} />
            </div>
        );
    }
});

var StopButton = React.createClass({
    render: function() {
        return (
            <div className="button stop-button"
                ref="button"
                onClick={this.props.onClick}>
                <i className="icon-stop" />
            </div>
        );
    }
});

var LoopButton = React.createClass({
    render: function() {
        var classes = "loop-button";
        if (this.props.loop) classes += " loop-button-on";

        return (
            <div className={classes} onClick={this.props.onClick}>
                <i className="icon-arrows-ccw" />
            </div>
        );
    }
});

var VolumeControl = React.createClass({
    getInitialState: function() {
        return { value: 100 };
    },

    componentWillMount: function() {
        this.iconClassName = "sprite-volume-up";
    },

    handleChange: function(name, val) {
        if (val > 75) {
            this.iconClassName = "sprite-volume-up";
        }
        else if (val > 25) {
            this.iconClassName = "sprite-volume";
        }
        else if (val > 0) {
            this.iconClassName = "sprite-volume-down";
        }
        else {
            this.iconClassName = "sprite-volume-off";
        }

        this.props.onChange(val / 100);

        this.setState({ value: val });
    },

    render: function() {
        return (
            <div className="volume">
                <div className="slider">
                    <RangeInput
                        name="progress"
                        min="0"
                        max="100"
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="icon">
                    <i className={this.iconClassName} />
                </div>
            </div>
        );
    }
});

var ProgressControl = React.createClass({
    getInitialState: function() {
        return { value: 0 };
    },

    componentWillMount: function() {
        this.max = 1000;
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.progressPosition !== 'undefined' && !this.refs.progress.isActive()) {
            this.setState({ value: props.progressPosition * this.max });
        }
    },

    handleChange: function(name, val) {
        this.setState({ value: val }, function(){
            this.props.onChange(this.getPosition());
        }.bind(this));
    },

    handleUpdate: function(name, val) {
        this.setState({ value: val }, function(){
            this.props.onUpdate(this.getPosition());
        }.bind(this));
    },

    getPosition: function() {
        var pos = this.state.value / this.max;
        if (pos > 1) pos = 1;

        return pos;
    },

    render: function() {
        return (
            <div className="progress">
                <RangeInput
                    ref="progress"
                    name="progress"
                    min="0"
                    max={this.max}
                    buffered={true}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onUpdate={this.handleUpdate}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
});

var TimeInfo = React.createClass({
    formatTime: function(val) {
        var time = Math.ceil(val);
        var hours   = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours * 3600)) / 60);
        var seconds = time - (hours * 3600) - (minutes * 60);

        if (hours < 10) hours = "0" + hours;
        if (minutes < 10 && hours !== "00") minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        var format = minutes + ':' + seconds;
        if (hours !== "00") format = hours + ':' + time;

        return format;
    },

    render: function() {
        var currentTime = this.formatTime(this.props.currentTime);
        var totalTime = this.formatTime(this.props.totalTime);

        return (
            <div className="time-info">
                <div className="time-part current-time">{currentTime}</div>
                <div className="time-part split"></div>
                <div className="time-part total-time">{totalTime}</div>
            </div>
        );
    }
});

module.exports = Player;