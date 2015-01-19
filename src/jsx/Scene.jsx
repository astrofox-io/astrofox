var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        this.canvas2d = this.refs.canvas2d.getDOMNode();
        this.canvas3d = this.refs.canvas3d.getDOMNode();
        //this.canvas3d.getContext('webgl', { preserveDrawingBuffer: true });
        this.renderer = new AstroFox.RenderManager(this.canvas2d, this.canvas3d);
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

        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        var timer = AstroFox.getTimer();
        var player = this.props.player;

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
        requestAnimationFrame(this.renderScene);

        this.renderer.render();
    },

    renderMovie: function() {
        this.renderer.renderMovie();
    },

    update: function(name, data) {
        if (name === "spectrum") {
            for (var prop in data) {
                if (this.bars.options.hasOwnProperty(prop)) {
                    this.bars.options[prop] = data[prop];
                }
            }
        }
    },

    render: function() {
        return (
            <div id="scene"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <Loading loading={this.state.loading} />
                <canvas ref="canvas3d" id="canvas3d" height="480" width="854"></canvas>
                <canvas ref="canvas2d" id="canvas2d" height="480" width="854" className="offScreen"></canvas>
            </div>
        );
    }
});