var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        var app = this.props.app;

        this.canvas = this.refs.canvas.getDOMNode();
        app.loadCanvas(this.canvas);

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

    isLoading: function(val) {
        this.setState({ loading: val });
    },

    renderScene: function() {
        requestAnimationFrame(this.renderScene);

        this.props.app.renderScene();
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