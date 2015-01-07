var ImageControl = React.createClass({
    getInitialState: function() {
        return {
            image: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            fixed: true,
            rotation: 0
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
            if (val !== null) {
                state.width = val.naturalWidth;
                state.height = val.naturalHeight;
            }
            else {
                state.width = 0;
                state.height = 0;
            }
            state.x = 0;
            state.y = 0;
        }
        else if (name === 'width' && this.state.image && this.state.fixed) {
            state.height = Math.round(val * (1 / this.getImageRatio()));
        }
        else if (name === 'height' && this.state.image && this.state.fixed) {
            state.width = Math.round(val * this.getImageRatio());
        }

        this.setState(state, function() {
            this.image.init(this.state);
            this.image.render();
        }.bind(this));
    },

    getImageRatio: function() {
        var image = this.state.image;

        return (image !== null) ?  image.naturalWidth / image.naturalHeight :  0;
    },

    renderScene: function(canvas) {
        if (this.image && this.state.image !== null) {
            var context = canvas.getContext('2d'),
                state = this.state,
                width = state.width / 2,
                height = state.height / 2;

            if (state.rotation % 360 !== 0) {
                context.save();
                context.translate(state.x, state.y);
                context.translate(width, height);
                context.rotate(state.rotation * Math.PI / 180);
                context.drawImage(this.canvas, -width, -height);
                context.restore();
            }
            else {
                context.drawImage(this.canvas, state.x, state.y);
            }
        }
    },

    render: function() {
        var image = this.state.image,
            readOnly = !image,
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
                    <label>Width</label>
                    <NumberInput
                        name="width"
                        size="3"
                        min={0}
                        max={maxWidth*2}
                        value={this.state.width}
                        readOnly={readOnly}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth*2}
                            value={this.state.width}
                            readOnly={readOnly}
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
                        readOnly={readOnly}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxHeight*2}
                            value={this.state.height}
                            readOnly={readOnly}
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
                    <label>Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
})