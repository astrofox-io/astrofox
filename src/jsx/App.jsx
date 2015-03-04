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


        this.openAction = null;
        this.saveAction = null;
    },

    handleClick: function(e) {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
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

        var files = e.target.files;

        if (files.length > 0) {
            this.openAction(files[0].path);
            this.refs.form.getDOMNode().reset();
        }
    },

    handleFileSave: function(e) {
        e.preventDefault();

        this.saveAction(this.saveInput.value);
        this.refs.form.getDOMNode().reset();
    },

    handleMenuAction: function(action) {
        switch (action) {
            case 'File/New Project':
                break;

            case 'File/Open Project':
                this.openAction = function(file) {
                    this.app.loadProject(file);
                }.bind(this);

                this.fileInput.click();
                break;

            case 'File/Save Project':
                this.saveAction = function(file) {
                    this.app.saveProject(file);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'project.afx');
                this.saveInput.click();
                break;

            case 'File/Import Audio':
                this.openAction = function(file) {
                    this.loadAudioFile(file);
                }.bind(this);

                this.fileInput.click();
                break;

            case 'File/Save Image':
                this.saveAction = function(file) {
                    this.app.saveImage(file);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'image.png');
                this.saveInput.click();
                break;

            case 'File/Save Video':
                this.saveAction = function(file) {
                    this.app.saveVideo(file);
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

    loadAudioFile: function(file) {
        var scene = this.refs.scene;

        scene.isLoading(true);

        this.app.loadAudioFile(file, function(error, data) {
            if (error) {
                scene.isLoading(false);
                throw error;
            }

            this.app.loadAudioData(
                data,
                function(error) {
                    if (error) {
                        scene.isLoading(false);
                        throw error;
                    }

                    this.setState({ filename: file.name }, function() {
                        scene.isLoading(false);
                    });
                }.bind(this)
            );
        }.bind(this));
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
                            onAudioFileLoaded={this.loadAudioFile}
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