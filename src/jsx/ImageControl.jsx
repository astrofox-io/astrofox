var ImageControl = React.createClass({
    getInitialState: function() {
        return {
            image: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            fixed: true,
            rotation: 0,
            opacity: 1.0
        };
    },

    componentWillMount: function() {
        this.config = {
            name: 'image',
            context: '2d'
        };
    },

    componentDidMount: function() {
        console.log('control mounted', this.config.name);
        this.canvas = document.createElement('canvas');
        this.image = new AstroFox.ImageDisplay(this.canvas, this.state);
        this.props.onLoad(this)
    },

    handleChange: function(name, val) {
        var state = {};
        state[name] = val;

        if (name === 'image') {
            state.width = 0;
            state.height = 0;
            state.x = 0;
            state.y = 0;
            state.rotation = 0;
            state.opacity = 1.0;

            if (val !== null) {
                state.width = val.naturalWidth;
                state.height = val.naturalHeight;
            }
        }
        else if (name === 'width' && this.state.image && this.state.fixed) {
            state.height = Math.round(val * (1 / this.getImageRatio()));
        }
        else if (name === 'height' && this.state.image && this.state.fixed) {
            state.width = Math.round(val * this.getImageRatio());
        }

        this.setState(state, function() {
            this.image.configure(this.state);
            this.image.render();
        }.bind(this));
    },

    handleLinkClick: function() {
        this.handleChange('fixed', !this.state.fixed);
    },

    getImageRatio: function() {
        var image = this.state.image;

        return (image !== null) ?  image.naturalWidth / image.naturalHeight :  0;
    },

    renderToCanvas: function(canvas) {
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
            imageWidth = (image) ? image.width : 0,
            imageHeight = (image) ? image.height : 0,
            readOnly = !image,
            maxSize = ((image) ? ((image.height > image.width) ? image.height : image.width) : 0) * 2,
            linkClasses = 'icon-link input-link';

        if (this.state.fixed) linkClasses += ' input-link-on';

        return (
            <div className="control">
                <div className="header"><span>IMAGE</span></div>
                <div className="row">
                    <label>Image</label>
                    <ImageInput
                        name="image"
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label>
                        Width
                        <i
                            className={linkClasses}
                            onClick={this.handleLinkClick}
                        />
                    </label>
                    <NumberInput
                        name="width"
                        size="3"
                        min={0}
                        max={imageWidth*2}
                        value={this.state.width}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={imageWidth*2}
                            value={this.state.width}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>
                        Height
                        <i
                            className={linkClasses}
                            onClick={this.handleLinkClick}
                        />
                    </label>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={imageHeight*2}
                        value={this.state.height}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={imageHeight*2}
                            value={this.state.height}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
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
                        min={-maxSize}
                        max={maxSize}
                        value={this.state.x}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxSize}
                            max={maxSize}
                            value={this.state.x}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxSize}
                        max={maxSize}
                        value={this.state.y}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxSize}
                            max={maxSize}
                            value={this.state.y}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
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
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.1}
                        value={this.state.opacity}
                        readOnly={readOnly}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.1}
                            value={this.state.opacity}
                            readOnly={readOnly}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
})