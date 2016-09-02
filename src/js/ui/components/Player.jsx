'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const { formatTime } = require('../../util/format');

const RangeInput = require('../inputs/RangeInput.jsx');

const PROGRESS_MAX = 1000;

class Player extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            looping: false,
            progressPosition: 0,
            duration: 0
        };

        this.player = Application.player;
    }

    componentDidMount() {
        const player = this.player;

        player.on('load', id => {
            this.setState({ duration: this.player.getDuration(id) });
        });

        player.on('tick', id => {
            if (this.player.isPlaying() && !this.refs.progress.isBuffering()) {
                this.setState({
                    progressPosition: this.player.getPosition(id)
                });
            }
        });

        player.on('play', () => {
            this.setState({ playing: true });
        });

        player.on('pause', () => {
            this.setState({ playing: false });
        });

        player.on('stop', () => {
            this.setState({ progressPosition: 0 });
        });

        player.on('seek', id => {
            this.setState({
                progressPosition: this.player.getPosition(id)
            });
        });
    }

    onPlayButtonClick() {
        this.player.play('audio');
    }

    onStopButtonClick() {
        this.player.stop('audio');
    }

    onLoopButtonClick() {
        let loop = !this.state.looping;

        this.setState({ looping: loop }, () => {
            this.player.setLoop(loop);
        });
    }

    onVolumeChange(val) {
        this.player.setVolume(val);
    }

    onProgressChange(val) {
        this.player.seek('audio', val);
    }

    onProgressInput(val) {
        console.log('input from player', val);
        this.setState({ progressPosition: val });
    }

    render() {
        let state = this.state,
            player = this.player,
            totalTime = state.duration,
            audioPosition = state.progressPosition,
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

class VolumeControl extends UIComponent {
    constructor(props) {
        super(props);

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
                    <span className={icon} />
                </div>
            </div>
        );
    }
}

class ProgressControl extends UIComponent {
    constructor(props) {
        super(props);

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
        <div className={classNames('loop-button', {'loop-button-on': props.loop })} onClick={props.onClick}>
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
            <span className="time-part split" />
            <span className="time-part total-time">{totalTime}</span>
        </div>
    );
};

module.exports = Player;