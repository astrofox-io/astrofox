var TextControl = React.createClass({
    name: 'text',
    context: '2d',

    getInitialState: function() {
        return {
            text: '',
            size: 40,
            font: 'Arial',
            italic: false,
            bold: false,
            x: 0,
            y: 0,
            color: '#FFFFFF',
            rotation: 0,
            opacity: 1.0
        };
    },

    componentWillMount: function() {
        this.fontOptions = [
            'Alegreya',
            'Arial',
            'Bangers',
            'Cardo',
            'Dynalight',
            'Fira Sans',
            'Merriweather',
            'Permanent Marker',
            'Oswald',
            'Oxygen',
            'Racing Sans One',
            'Raleway',
            'Roboto'
        ];
    },

    componentDidMount: function() {
        var FX = this.props.app.FX;

        console.log('control mounted', this.name);
        this.canvas = document.createElement('canvas');
        this.text = new FX.TextDisplay(this.canvas, this.state);
        this.props.onLoad(this)
    },

    handleChange: function(name, val) {
        var state = {};
        state[name] = val;
        this.setState(state, function() {
            this.text.init(this.state);
            this.text.render();
        }.bind(this));
    },

    getConfiguration: function() {
        return {
            name: this.name,
            values: this.state
        };
    },

    renderToCanvas: function(context) {
        if (this.state.text == '') return;

        var state = this.state,
            width = this.canvas.width / 2,
            height = this.canvas.height / 2;

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
    },

    render: function() {
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <div className="header"><span>TEXT</span></div>
                <div className="row">
                    <label>Text</label>
                    <TextInput
                        name="text"
                        size="20"
                        value={this.state.text}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Font</label>
                    <SelectInput
                        name="font"
                        size="20"
                        items={this.fontOptions}
                        value={this.state.font}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        min={0}
                        value={this.state.size}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Bold</label>
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.handleChange} />
                    <label>Italic</label>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>X</label>
                    <NumberInput
                        name="x"
                        size="3"
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
                <div className="row">
                    <label>Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.1}
                        value={this.state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.1}
                            value={this.state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});