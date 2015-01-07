var App = React.createClass({
    getInitialState: function() {
        return {
            filename: ''
        };
    },

    componentWillMount: function() {
        this.audioContext = AstroFox.getAudioContext();
        this.player = new AstroFox.Player(this.audioContext);
    },

    handleFileLoad: function(file, data, callback) {
        var player = this.player;
        var sound = new AstroFox.BufferedSound();
        var timer = AstroFox.getTimer();

        sound.on('load', function() {
            console.log('sound loaded', timer.get('sound_load'));

            /*
            timer.set('sound_process');
            player.process(sound.buffer, function(max){
                player.spectrum.options.maxVal = max;
                console.log('sound processed', timer.get('sound_process'), max);
            });
            */

            player.load('audio', sound);
            player.play('audio');

            this.setState({ filename: file.name });

            if (callback) callback();
        }.bind(this));

        sound.on('error', function() {
            this.refs.scene.isLoading(false);
        }.bind(this));

        timer.set('sound_load');
        sound.load(data);
    },

    handlePlayerProgressChange: function() {
        this.refs.waveform.forceUpdate();
    },

    handleWaveformProgressChange: function() {
        this.refs.player.forceUpdate();
    },

    handleControlLoad: function(control) {
        this.refs.scene.registerControl(control);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    render: function() {
        return (
            <div id="container"
                onDrop={this.handleDragDrop}
                onDragOver={this.handleDragDrop}>
                <Header />
                <MenuBar />
                <div id="body">
                    <div id="view">
                        <Scene
                            ref="scene"
                            player={this.player}
                            onFileLoaded={this.handleFileLoad}
                        />
                        <Waveform
                            ref="waveform"
                            player={this.player}
                            onProgressChange={this.handleWaveformProgressChange}
                        />
                        <Player
                            ref="player"
                            player={this.player}
                            onProgressChange={this.handlePlayerProgressChange}
                        />
                    </div>
                    <ControlDock
                        ref="dock"
                        player={this.player}
                        onControlLoad={this.handleControlLoad}
                    />
                </div>
                <Footer filename={this.state.filename} />
            </div>
        );
    }
});

var Header = React.createClass({
    render: function() {
        return (
            <div id="header">
                <div id="title">ASTROFOX</div>
                <div id="control-box">
                    <ul>
                        <li className="box icon-minus"></li>
                        <li className="box icon-popup"></li>
                        <li className="box icon-cancel"></li>
                    </ul>
                </div>
            </div>
        );
    }
});

var Footer = React.createClass({
    render: function() {
        return (
            <div id="footer">
                <div className="filename">{this.props.filename}</div>
                <div className="version">v1.0</div>
            </div>
        );
    }
});

var MenuBar = React.createClass({
    render: function() {
        return (
            <div id="menu">
                <ul>
                    <li>File</li>
                    <li>Settings</li>
                    <li>Help</li>
                </ul>
            </div>
        );
    }
});