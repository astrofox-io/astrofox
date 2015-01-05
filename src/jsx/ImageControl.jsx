var ImageControl = React.createClass({
    getInitialState: function() {
        return {
            image: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            fixed: true,
            ratio: 0
        };
    },

    componentWillMount: function() {
        this.name = 'image';
        this.context = '2d';
    },

    componentDidMount: function() {
        console.log('control mounted', this.name);
        this.canvas = this.refs.canvas.getDOMNode();
        this.image = new AstroFox.ImageDisplay(this.canvas, this.state);
        this.props.onLoad(this)
    },

    handleChange: function(name, val) {
        var state = {};
        state[name] = val;

        if (name === 'image') {
            state.width = val.naturalWidth;
            state.height = val.naturalHeight;
            state.ratio = val.naturalWidth / val.naturalHeight;
            state.x = 0;
            state.y = 0;
        }
        else if (name === 'width' && this.state.fixed) {
            state.height = Math.round(val * (1 / this.state.ratio));
        }
        else if (name === 'height' && this.state.fixed) {
            state.width = Math.round(val * this.state.ratio);
        }

        this.setState(state, function() {
            this.image.init(this.state);
            this.image.render();
        }.bind(this));
    },

    renderScene: function(canvas) {
        if (this.image && this.state.image !== null) {
            var context = canvas.getContext('2d');
            context.drawImage(this.canvas, 0, 0);
        }
    },

    render: function() {
        var image = this.state.image,
            maxHeight = ((image) ? image.height : 480),
            maxWidth = ((image) ? image.width : 854);

        return (
            <div className="control">
                <canvas ref="canvas" className="offScreen" width="854" height="480" />
                <div className="header"><span>IMAGE</span></div>
                <div className="row">
                    <label>Image</label>
                    <ImageInput
                        name="image"
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Width</label>
                    <NumberInput
                        name="width"
                        size="3"
                        min={0}
                        max={maxWidth*2}
                        value={this.state.width}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth*2}
                            value={this.state.width}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Height</label>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={maxHeight*2}
                        value={this.state.height}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxHeight*2}
                            value={this.state.height}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Fixed Scaling</label>
                    <ToggleInput
                        name="fixed"
                        value={this.state.fixed}
                        onChange={this.handleChange}
                    />
                </div>
            </div>
        );
    }
})