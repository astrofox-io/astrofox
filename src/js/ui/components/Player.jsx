'use strict';

const React = require('react');
const classNames = require('classnames');
const Application = require('../../core/Application.js');
const RangeInput = require('../inputs/RangeInput.jsx');

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = { playing: false, progressPosition: 0 };

        this.onProgressUpdate = this.onProgressUpdate.bind(this);
    }

    componentDidMount() {
        const player = Application.player;

        player.on('tick', function() {
            if (player.isPlaying()) {
                this.setState({
                    progressPosition: this.refs.progress.getPosition()
                });
            }
        }, this);

        player.on('play', function() {
            this.setState({ playing: true });
        }, this);

        player.on('pause', function() {
            this.setState({ playing: false });
        }, this);

        player.on('stop', function() {
            this.setState({ progressPosition: 0 });
        }, this);

        player.on('seek', function() {
            this.setState({
                progressPosition: this.refs.progress.getPosition()
            });
        }, this);
    }

    onPlayButtonClick() {
        Application.player.play('audio');
    }

    onStopButtonClick() {
        Application.player.stop('audio');
    }

    onLoopButtonClick() {
        Application.player.toggleLoop();
        this.forceUpdate();
    }

    onVolumeChange(val) {
        Application.player.setVolume(val);
    }

    onProgressChange(val) {
        Application.player.seek('audio', val);
    }

    onProgressUpdate(val) {
        this.setState({ progressPosition: val });
    }

    render() {
        var state = this.state,
            player = Application.player,
            totalTime = player.getDuration('audio'),
            audioPosition = player.getPosition('audio'),
            currentTime = state.progressPosition * totalTime,
            isPlaying = player.isPlaying(),
            loop = player.options.loop,
            style = {};

        if (!this.props.visible) {
            style.display = 'none';
        }

        return (
            <div className="player" style={style}>
                <div className="buttons">
                    <PlayButton playing={isPlaying} onClick={this.onPlayButtonClick} />
                    <StopButton onClick={this.onStopButtonClick} />
                </div>
                <VolumeControl onChange={this.onVolumeChange} />
                <ProgressControl
                    ref="progress"
                    progressPosition={audioPosition}
                    onChange={this.onProgressChange}
                    onUpdate={this.onProgressUpdate}
                    readOnly={totalTime==0}
                />
                <TimeInfo
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
}

Player.defaultProps = { visible: true };

class VolumeControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: 100 };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(name, val) {
        this.props.onChange(val / 100);

        this.setState({ value: val });
    }

    render() {
        let icon = 'icon-volume4',
            val = this.state.value;

        if (val > 75) {
            icon = "icon-volume";
        }
        else if (val > 25) {
            icon = "icon-volume2";
        }
        else if (val > 0) {
            icon = "icon-volume3";
        }

        return (
            <div className="volume">
                <div className="slider">
                    <RangeInput
                        name="progress"
                        min="0"
                        max="100"
                        value={val}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="speaker">
                    <i className={icon} />
                </div>
            </div>
        );
    }
}

class ProgressControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: 0 };
        this.max = 1000;

        this.handleChange = this.handleChange.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.getPosition = this.getPosition.bind(this);
    }

    componentWillReceiveProps(props) {
        if (typeof props.progressPosition !== 'undefined' && !this.refs.progress.isActive()) {
            this.setState({ value: props.progressPosition * this.max });
        }
    }

    handleChange(name, val) {
        this.setState({ value: val }, function(){
            this.props.onChange(this.getPosition());
        }.bind(this));
    }

    handleUpdate(name, val) {
        this.setState({ value: val }, function(){
            this.props.onUpdate(this.getPosition());
        }.bind(this));
    }

    getPosition() {
        var pos = this.state.value / this.max;
        if (pos > 1) pos = 1;

        return pos;
    }

    render() {
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
}

const PlayButton = function(props) {
    return (
        <div className="button play-button" onClick={props.onClick}>
            <i className={props.playing ? 'icon-pause' : 'icon-play'} />
        </div>
    );
};

const StopButton = function(props) {
    return (
        <div className="button stop-button" onClick={props.onClick}>
            <i className="icon-stop" />
        </div>
    );
};

const LoopButton = function(props) {
    return (
        <div className={classNames({'loop-button': true, 'loop-button-on': props.loop })} onClick={props.onClick}>
            <i className="icon-refresh" title="Repeat" />
        </div>
    );
};

const TimeInfo = function(props) {
    var currentTime = formatTime(props.currentTime);
    var totalTime = formatTime(props.totalTime);

    return (
        <div className="time-info">
            <div className="time-part current-time">{currentTime}</div>
            <div className="time-part split"></div>
            <div className="time-part total-time">{totalTime}</div>
        </div>
    );
};

function formatTime(val) {
    let time = Math.ceil(val);
    let hours   = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = time - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10 && hours !== "00") minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    let format = minutes + ':' + seconds;
    if (hours !== "00") format = hours + ':' + time;

    return format;
}

module.exports = Player;