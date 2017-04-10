import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import AudioWaveform from './AudioWaveform';
import Oscilloscope from './Oscilloscope';
import Spectrum from './Spectrum';
import { events } from '../../core/Global';
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
            showWaveform: true,
            showSpectrum: false,
            showOsc: false
        };

        this.app = context.app;
    }

    componentDidMount() {
        const player = this.app.player;

        player.on('load', id => {
            this.setState({ duration: player.getDuration(id) });

            if (this.waveform) {
                this.waveform.renderBars(this.app.getAudio());
            }
        });

        player.on('tick', id => {
            if (player.isPlaying() && !this.progressControl.isBuffering()) {
                let pos = player.getPosition(id);

                this.setState({ progressPosition: pos });

                if (this.waveform) {
                    this.waveform.position = pos;
                    this.waveform.draw(pos);
                }
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

            if (this.waveform) {
                this.waveform.position = 0;
                this.waveform.seek = 0;
                this.waveform.draw();
            }
        });

        player.on('seek', id => {
            let pos = player.getPosition(id);

            this.setState({
                progressPosition: pos
            });

            if (this.waveform) {
                this.waveform.position = pos;
                this.waveform.seek = pos;
                this.waveform.draw();
            }
        });

        events.on('render', data => {
            if (this.spectrum) {
                this.spectrum.draw(data);
            }

            if (this.oscilloscope) {
                this.oscilloscope.draw(data);
            }
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

    onWaveformClick(val) {
        this.app.seekAudio(val);
    }

    onWaveformButtonClick() {
        this.setState({ showWaveform: !this.state.showWaveform });
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
        this.app.seekAudio(val);
    }

    onProgressInput(val) {
        this.setState({ progressPosition: val });
    }

    render() {
        let spectrum, osc,
            playing = this.app.player.isPlaying(),
            { duration, progressPosition, looping, showWaveform, showSpectrum, showOsc } = this.state;

        if (showSpectrum) {
            spectrum = <Spectrum ref={el => this.spectrum = el} />;
        }

        if (showOsc) {
            osc = <Oscilloscope ref={el => this.oscilloscope = el} />;
        }

        return (
            <div className={classNames({ 'display-none': !this.props.visible })}>
                <AudioWaveform
                    ref={el => this.waveform = el}
                    visible={showWaveform && duration}
                    onClick={this.onWaveformClick}
                />
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
                        readOnly={!duration}
                    />
                    <TimeInfo
                        currentTime={duration * progressPosition}
                        totalTime={duration}
                    />
                    <ToggleButton
                        icon="icon-sound-bars"
                        title="Waveform"
                        active={showWaveform}
                        onClick={this.onWaveformButtonClick}
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
                    <ToggleButton
                        icon="icon-cycle"
                        title="Repeat"
                        active={looping}
                        onClick={this.onLoopButtonClick}
                    />
                </div>
                {osc}
                {spectrum}
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

        this.state = {
            value: 100,
            mute: false
        };
    }

    onChange(name, value) {
        this.props.onChange(value / 100);

        this.setState({ value: value, mute: false });
    }

    onClick() {
        this.setState((prevState, props) => {
            props.onChange(prevState.mute ? prevState.value / 100 : 0);

            return { mute: !prevState.mute };
        });
    }

    render() {
        let icon,
            { value, mute } = this.state;

        if (value < 10 || mute) {
            icon = 'icon-volume4';
        }
        else if (value < 25) {
            icon = 'icon-volume3';
        }
        else if (value < 75) {
            icon = 'icon-volume2';
        }
        else {
            icon = 'icon-volume';
        }

        return (
            <div className="volume">
                <div className="speaker" onClick={this.onClick}>
                    <span className={icon} />
                </div>
                <div className="slider">
                    <RangeInput
                        name="volume"
                        min={0}
                        max={100}
                        value={mute ? 0 : value}
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
            <span
                className={props.playing ? 'icon-pause' : 'icon-play'}
                title={props.playing ? 'Pause' : 'Play'}
            />
        </div>
    );
};

const StopButton = (props) => {
    return (
        <div className="button stop-button" onClick={props.onClick}>
            <span className="icon-stop" title="Stop" />
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