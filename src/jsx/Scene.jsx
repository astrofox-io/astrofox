var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        var app = this.props.app;

        this.canvas3d = this.refs.canvas3d.getDOMNode();
        app.loadCanvas(this.canvas3d);

        this.renderer = app.renderer;
        // DEBUG
        console.log('scene loaded');

        this.renderScene();
    },

    handleDragOver: function(e){
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0],
            reader = new FileReader(),
            player = this.props.app.player,
            timer = this.props.app.timer;

        player.stop('audio');

        reader.onload = function(fe) {
            // DEBUG
            console.log('file loaded', timer.get('file_load'));
            var data = fe.target.result;
            this.props.onFileLoaded(file, data, function() {
                this.isLoading(false);
            }.bind(this));
        }.bind(this);

        timer.set('file_load');
        reader.readAsArrayBuffer(file);

        this.isLoading(true);
    },

    registerControl: function(control) {
        // DEBUG
        console.log('control registered', control.config.name);
        this.renderer.registerControl(control);
    },

    unregisterControl: function(control) {
        // DEBUG
        console.log('control unregistered', control.config.name);
        this.renderer.unregisterControl(control);
    },

    isLoading: function(val) {
        this.setState({ loading: val });
    },

    renderScene: function() {
        var player = this.props.app.player;

        requestAnimationFrame(this.renderScene);

        this.renderer.render();
    },

    saveVideo: function() {
        var player = this.props.app.player;
        var sound = player.getSound('audio');

        if (player.isPlaying()) player.stop('audio');

        if (sound) {
            this.renderer.renderVideo(player);
        }
    },

    saveImage: function() {
        this.renderer.renderImage(function(buffer){
            Node.FS.writeFile('d:/image-' + Date.now() + '.png', buffer);
        });
    },

    render: function() {
        return (
            <div id="scene"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <Loading loading={this.state.loading} />
                <canvas ref="canvas3d" id="canvas3d" height="480" width="854"></canvas>
            </div>
        );
    }
});