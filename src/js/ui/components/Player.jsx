'use strict';

const React = require('react');
const classNames = require('classnames');
const Application = require('../../core/Application.js');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const PROGRESS_MAX = 1000;

class Player extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            playing: false,
            looping: false,
            progressPosition: 0,
            duration: 0
        };
    }

    componentDidMount() {
        const player = Application.player;

        player.on('load', (id) => {
            this.setState({ duration: player.getDuration(id) });
        }, this);

        player.on('tick', (id) => {
            if (player.isPlaying() && !this.refs.progress.isBuffering()) {
                this.setState({
                    progressPosition: player.getPosition(id)
                });
            }
        }, this);

        player.on('play', () => {
            this.setState({ playing: true });
        }, this);

        player.on('pause', () => {
            this.setState({ playing: false });
        }, this);

        player.on('stop', () => {
            this.setState({ progressPosition: 0 });
        }, this);

        player.on('seek', (id) => {
            this.setState({
                progressPosition: player.getPosition(id)
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
        let loop = !this.state.looping;

        this.setState({ looping: loop }, () => {
            Application.player.setLoop(loop);
        });
    }

    onVolumeChange(val) {
        Application.player.setVolume(val);
    }

    onProgressChange(val) {
        Application.player.seek('audio', val);
    }

    onProgressInput(val) {
        this.setState({ progressPosition: val });
    }

    render() {
        let state = this.state,
            player = Application.player,
            totalTime = state.duration,
            audioPosition = state.progressPosition, //player.getPosition('audio'),
            currentTime = state.progressPosition * totalTime,
            playing = player.isPlaying(),
            loop = player.isLooping(),
            style = {};

        if (!this.props.visible) {
            style.display = 'none';
        }

        return (
            <div className="player" style={style}>
                <div className="buttons">
                    <PlayButton playing={playing} onClick={this.onPlayButtonClick} />
                    <StopButton onClick={this.onStopButtonClick} />
                </div>
                <VolumeControl onChange={this.onVolumeChange} />
                <ProgressControl
                    ref="progress"
                    value={audioPosition * 1000}
                    onChange={this.onProgressChange}
                    onInput={this.onProgressInput}
                    readOnly={totalTime==0}
                />
                <TimeInfo
                    currentTime={currentTime}
                    totalTime={totalTime}
                />
                <LoopButton loop={loop} onClick={this.onLoopButtonClick} />
            </div>
        );
    }
}

Player.defaultProps = { visible: true };

class VolumeControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = { value: 100 };
    }

    onChange(name, val) {
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
                        min={0}
                        max={100}
                        value={val}
                        onChange={this.onChange}
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
        autoBind(this);

        this.state = {
            value: 0
        };
    }

    componentWillReceiveProps(props) {
        if (!this.refs.progress.isBuffering())
        {
            this.setState({ value: props.value });
        }
    }

    onChange(name, val) {
        this.setState({ value: val }, () => {
            this.props.onChange(val / PROGRESS_MAX);
        });
    }

    onInput(name, val) {
        this.setState({ value: val }, () => {
            this.props.onInput(val / PROGRESS_MAX);
        });
    }

    isBuffering() {
        return this.refs.progress.isBuffering();
    }

    render() {
        return (
            <div className="progress">
                <RangeInput
                    ref="progress"
                    name="progress"
                    min="0"
                    max={PROGRESS_MAX}
                    value={this.state.value}
                    buffered={true}
                    onChange={this.onChange}
                    onInput={this.onInput}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
}

const PlayButton = (props) => {
    return (
        <div className="button play-button" onClick={props.onClick}>
            <span className={props.playing ? 'icon-pause' : 'icon-play'} />
        </div>
    );
};

const StopButton = (props) => {
    return (
        <div className="button stop-button" onClick={props.onClick}>
            <span className="icon-stop" />
        </div>
    );
};

const LoopButton = (props) => {
    return (
        <div className={classNames({'loop-button', 'loop-button-on': props.loop })} onClick={props.onClick}>
            <span className="icon-refresh" title="Repeat" />
        </div>
    );
};

const TimeInfo = (props) => {
    let currentTime = formatTime(props.currentTime);
    let totalTime = formatTime(props.totalTime);

    return (
        <div className="time-info">
            <span className="time-part current-time">{currentTime}</span>
            <span className="time-part split"></span>
            <span className="time-part total-time">{totalTime}</span>
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