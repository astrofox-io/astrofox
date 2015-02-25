var App = React.createClass({
    getInitialState: function() {
        return {
            filename: ''
        };
    },

    componentWillMount: function() {
        this.app = new AstroFox.Application();
    },

    componentDidMount: function() {
        this.file = this.refs.file.getDOMNode();
    },

    handleClick: function(e) {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleFileLoad: function(file, callback, error) {
        this.app.loadAudioFile(file, function(data) {
            this.app.loadAudioData(
                data,
                function() {
                    this.setState({ filename: file.name }, callback);
                }.bind(this),
                error
            );
        }.bind(this));
    },

    handlePlayerProgressChange: function() {
        this.refs.waveform.forceUpdate();
    },

    handleWaveformProgressChange: function() {
        this.refs.player.forceUpdate();
    },

    handleControlLoad: function(control) {
        this.app.registerControl(control);
    },

    handleFileOpen: function(e) {
        e.preventDefault();

        if (e.target.files.length > 0) {
            var scene = this.refs.scene,
                file = e.target.files[0];

            scene.isLoading(true);

            this.handleFileLoad(
                file,
                function() {
                    scene.isLoading(false);
                },
                function() {
                    scene.isLoading(false);
                }
            );
        }
    },

    handleMenuAction: function(action) {
        switch (action) {
            case 'File/Import Audio':
                this.file.click();
                break;
            case 'File/Save Image':
                this.app.saveImage('d:/image-' + Date.now() + '.png');
                break;
            case 'File/Save Video':
                this.app.saveVideo('d:/movie-' + Date.now() + '.mp4');
                break;
            case 'Edit/Settings':
                this.loadSettings();
                break;
            case 'Help/About':
                this.showAbout();
                break;
        }
    },

    loadSettings: function() {

    },

    showAbout: function() {
        this.refs.modal.show(<div>oh hai!</div>);
    },

    render: function() {
        return (
            <div
                id="container"
                onClick={this.handleClick}
                onDrop={this.handleDragDrop}
                onDragOver={this.handleDragDrop}>
                <Header />
                <MenuBar
                    ref="menu"
                    app={this.app}
                    onMenuAction={this.handleMenuAction}
                />
                <div id="body">
                    <ModalWindow ref="modal" width={400} height={300} />
                    <div id="view">
                        <Scene
                            ref="scene"
                            app={this.app}
                            onFileLoaded={this.handleFileLoad}
                        />
                        <Waveform
                            ref="waveform"
                            app={this.app}
                            onProgressChange={this.handleWaveformProgressChange}
                        />
                        <Player
                            ref="player"
                            app={this.app}
                            onProgressChange={this.handlePlayerProgressChange}
                        />
                    </div>
                    <ControlDock
                        ref="dock"
                        app={this.app}
                        onControlLoad={this.handleControlLoad}
                    />
                </div>
                <Footer
                    app={this.app}
                    filename={this.state.filename}
                />
                <input
                    ref="file"
                    type="file"
                    className="hidden"
                    onChange={this.handleFileOpen}
                />
            </div>
        );
    }
});