var Player = React.createClass({
    componentDidMount: function() {
        var player = this.props.player;

        player.on('time', function() {
            if (player.isPlaying()) {
                this.forceUpdate();
            }
        }.bind(this));

        player.on('stop', function() {
            this.forceUpdate();
        }.bind(this));
    },

    onPlayButtonClick: function() {
        this.props.player.play('audio');
        this.forceUpdate();
    },

    onStopButtonClick: function() {
        this.props.player.stop('audio');
        this.forceUpdate();
    },

    onVolumeChange: function(val) {
        this.props.player.setVolume(val);
    },

    onProgressChange: function(val) {
        this.props.player.seek('audio', val);
        this.props.onProgressChange(val);
        this.forceUpdate();
    },

    onProgressUpdate: function(val) {
        this.forceUpdate();
    },

    getCurrentTime: function() {
        var player = this.props.player;

        if (this.refs.progress) {
            return this.refs.progress.getPosition() * this.getTotalTime();
        }

        return player.getCurrentTime();
    },

    getTotalTime: function() {
        var player = this.props.player;
        return player.getDuration('audio');
    },

    render: function() {
        var player = this.props.player;
        var currentTime = this.getCurrentTime();
        var totalTime = this.getTotalTime();
        var isPlaying = player.isPlaying();
        var progressPosition = player.getProgress('audio');

        return (
            <div id="player">
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
                    progressPosition={progressPosition}
                    onChange={this.onProgressChange}
                    onUpdate={this.onProgressUpdate}
                    readOnly={totalTime==0}
                />
                <TimeInfo
                    ref="time"
                    currentTime={currentTime}
                    totalTime={totalTime}
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
        this.setState({ playing: props.isPlaying })
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
            this.setState({value: props.progressPosition * this.max});
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
        return this.state.value / this.max;
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
                <div className="current-time">{currentTime}</div>
                <div className="split"></div>
                <div className="total-time">{totalTime}</div>
            </div>
        );
    }
});