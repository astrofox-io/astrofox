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
        this.fileInput = this.refs.file.getDOMNode();
        this.saveInput = this.refs.save.getDOMNode();
        this.saveInput.setAttribute('nwsaveas', '');
        this.saveAction = null;
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

    handleFileSave: function(e) {
        e.preventDefault();

        this.saveAction(this.saveInput.value);

        this.refs.form.getDOMNode().reset();
    },

    handleMenuAction: function(action) {
        switch (action) {
            case 'File/Import Audio':
                this.fileInput.click();
                break;

            case 'File/Save Image':
                this.saveAction = function(val) {
                    this.app.saveImage(val);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'image.png');
                this.saveInput.click();
                break;

            case 'File/Save Video':
                this.saveAction = function(val) {
                    this.app.saveVideo(val);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'video.mp4');
                this.saveInput.click();
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
        this.refs.modal.show(<div>settings!</div>);
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
                <form ref="form" className="off-screen">
                    <input
                        ref="file"
                        type="file"
                        onChange={this.handleFileOpen}
                    />
                    <input
                        ref="save"
                        type="file"
                        onChange={this.handleFileSave}
                    />
                </form>
            </div>
        );
    }
});