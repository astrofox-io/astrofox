var ImageControl = React.createClass({
    name: 'image',
    context: '2d',

    getInitialState: function() {
        return {
            src: '',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            fixed: true,
            rotation: 0,
            opacity: 0
        };
    },

    componentWillMount: function() {
        this.img = new Image();
    },

    componentDidMount: function() {
        var FX = this.props.app.FX;

        console.log('control mounted', this.name);

        this.canvas = document.createElement('canvas');
        this.image = new FX.ImageDisplay(this.canvas, this.state);

        this.props.onLoad(this)
    },

    componentDidUpdate: function() {
        var state = this.state,
            img = this.img,
            options = {
                image: (img.src) ? img : null,
                height: state.height,
                width: state.width,
                opacity: state.opacity
            };

        this.image.init(options);
        this.image.render();
    },

    handleChange: function(name, val) {
        var obj = {},
            state = this.state,
            img = this.img,
            ratio = (img.src) ? img.naturalWidth / img.naturalHeight : 0;

        obj[name] = val;

        if (name === 'src') {
            obj.width = 0;
            obj.height = 0;
            obj.x = 0;
            obj.y = 0;
            obj.rotation = 0;
            obj.opacity = 0;

            if (val !== '') {
                img.src = val;
                obj.opacity = 1.0;
                obj.width = img.naturalWidth;
                obj.height = img.naturalHeight;
            }
        }
        else if (name === 'width' && state.src && state.fixed) {
            obj.height = Math.round(val * (1 / ratio));
        }
        else if (name === 'height' && state.src && state.fixed) {
            obj.width = Math.round(val * ratio);
        }

        this.setState(obj);
    },

    handleLinkClick: function() {
        this.handleChange('fixed', !this.state.fixed);
    },

    getConfiguration: function() {
        return {
            name: this.name,
            values: this.state
        };
    },

    renderToCanvas: function(context) {
        if (this.state.src) {
            var state = this.state,
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
        var state = this.state,
            img = this.img,
            readOnly = !state.src,
            imageWidth = (readOnly) ? 0 : img.width,
            imageHeight = (readOnly) ? 0 : img.height,
            maxSize = ((!readOnly) ? ((img.height > img.width) ? img.height : img.width) : 0) * 2,
            linkClasses = 'icon-link input-link';

        if (state.fixed) linkClasses += ' input-link-on';

        return (
            <div className="control">
                <div className="header"><span>IMAGE</span></div>
                <div className="row">
                    <label>Image</label>
                    <ImageInput
                        name="image"
                        src={state.src}
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
                        value={state.width}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={imageWidth*2}
                            value={state.width}
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
                        value={state.height}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={imageHeight*2}
                            value={state.height}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxSize}
                        max={maxSize}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxSize}
                            max={maxSize}
                            value={state.x}
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
                        value={state.y}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxSize}
                            max={maxSize}
                            value={state.y}
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
                        value={state.rotation}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={state.rotation}
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
                        value={state.opacity}
                        readOnly={readOnly}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.1}
                            value={state.opacity}
                            readOnly={readOnly}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
})