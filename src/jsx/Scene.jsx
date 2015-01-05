var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        this.canvas = this.refs.canvas.getDOMNode();
        this.renderer = new AstroFox.RenderManager(this.canvas);
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
        console.log('control registered', control.name);
        this.renderer.registerControl(control);
    },

    unregisterControl: function(control) {
        // DEBUG
        console.log('control unregistered', control.name);
        this.renderer.unregisterControl(control);
    },

    isLoading: function(val) {
        this.setState({ loading: val });
    },

    clearScene: function() {
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    renderScene: function() {
        requestAnimationFrame(this.renderScene);

        this.clearScene();

        this.renderer.render(this.canvas);
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
                <canvas ref="canvas" id="canvas" height="480" width="854"></canvas>
            </div>
        );
    }
});