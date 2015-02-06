var App = React.createClass({
    getInitialState: function() {
        return {
            filename: ''
        };
    },

    componentWillMount: function() {
        this.app = new AstroFox.Application();
    },

    handleClick: function(e) {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleFileLoad: function(filename, data, callback) {
        this.app.loadAudio(
            data,
            function(){
                this.setState({ filename: filename }, callback);
            }.bind(this),
            function(){
                this.refs.scene.isLoading(false);
            }.bind(this)
        );
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

    handleMenuAction: function(action) {
        switch (action) {
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
                break;
        }
    },

    loadSettings: function() {

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
            </div>
        );
    }
});