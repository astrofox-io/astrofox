import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import AudioWaveform from './AudioWaveform';
import Oscilloscope from './Oscilloscope';
import Spectrum from './Spectrum';
import { formatTime } from '../../util/format';
import RangeInput from '../inputs/RangeInput';

const PROGRESS_MAX = 1000;

export default class Player extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            playing: false,
            looping: false,
            progressPosition: 0,
            duration: 0,
            showSpectrum: false,
            showOsc: false
        };

        this.app = context.app;
    }

    componentDidMount() {
        const player = this.app.player;

        player.on('load', id => {
            this.setState({ duration: player.getDuration(id) });
        });

        player.on('tick', id => {
            if (player.isPlaying() && !this.progressControl.isBuffering()) {
                this.setState({
                    progressPosition: player.getPosition(id)
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
                progressPosition: player.getPosition(id)
            });
        });
    }

    onPlayButtonClick() {
        this.app.playAudio();
    }

    onStopButtonClick() {
        this.app.stopAudio();
    }

    onLoopButtonClick() {
        let loop = !this.state.looping;

        this.setState({ looping: loop }, () => {
            this.app.player.setLoop(loop);
        });
    }

    onSpectrumButtonClick() {
        this.setState({ showSpectrum: !this.state.showSpectrum });
    }

    onOscButtonClick() {
        this.setState({ showOsc: !this.state.showOsc });
    }

    onVolumeChange(val) {
        this.app.player.setVolume(val);
    }

    onProgressChange(val) {
        this.app.player.seek('audio', val);
    }

    onProgressInput(val) {
        this.setState({ progressPosition: val });
    }

    render() {
        let player = this.app.player,
            { duration, progressPosition, looping, showSpectrum, showOsc } = this.state,
            playing = player.isPlaying(),
            style = {};

        if (!this.props.visible) {
            style.display = 'none';
        }

        return (
            <div style={style}>
                <AudioWaveform />
                <div className="player">
                    <div className="buttons">
                        <PlayButton playing={playing} onClick={this.onPlayButtonClick} />
                        <StopButton onClick={this.onStopButtonClick} />
                    </div>
                    <VolumeControl onChange={this.onVolumeChange} />
                    <ProgressControl
                        ref={el => this.progressControl = el}
                        value={progressPosition * PROGRESS_MAX}
                        onChange={this.onProgressChange}
                        onInput={this.onProgressInput}
                        readOnly={duration==0}
                    />
                    <TimeInfo
                        currentTime={duration * progressPosition}
                        totalTime={duration}
                    />
                    <ToggleButton
                        icon="icon-refresh"
                        title="Repeat"
                        active={looping}
                        onClick={this.onLoopButtonClick}
                    />
                    <ToggleButton
                        icon="icon-sound-waves"
                        title="Oscilloscope"
                        active={showOsc}
                        onClick={this.onOscButtonClick}
                    />
                    <ToggleButton
                        icon="icon-bar-graph"
                        title="Spectrum"
                        active={showSpectrum}
                        onClick={this.onSpectrumButtonClick}
                    />
                </div>
                <Oscilloscope visible={showOsc} />
                <Spectrum visible={showSpectrum} />

            </div>
        );
    }
}

Player.defaultProps = {
    visible: true
};

Player.contextTypes = {
    app: React.PropTypes.object
};

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
            icon = 'icon-volume';
        }
        else if (val > 25) {
            icon = 'icon-volume2';
        }
        else if (val > 0) {
            icon = 'icon-volume3';
        }

        return (
            <div className="volume">
                <div className="speaker">
                    <span className={icon} />
                </div>
                <div className="slider">
                    <RangeInput
                        name="volume"
                        min={0}
                        max={100}
                        value={val}
                        onChange={this.onChange}
                    />
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
        if (!this.isBuffering())
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
        return this.progressInput.isBuffering();
    }

    render() {
        return (
            <div className="progress">
                <RangeInput
                    ref={el => this.progressInput = el}
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

const ToggleButton = (props) => {
    return (
        <div className={classNames('toggle-button', {'toggle-button-on': props.active })} onClick={props.onClick}>
            <span className={props.icon} title={props.title} />
        </div>
    );
};

const TimeInfo = (props) => {
    return (
        <div className="time-info">
            <span className="time-part current-time">{formatTime(props.currentTime)}</span>
            <span className="time-part split" />
            <span className="time-part total-time">{formatTime(props.totalTime)}</span>
        </div>
    );
};