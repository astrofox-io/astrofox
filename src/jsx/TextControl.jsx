var TextControl = React.createClass({
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
        this.config = {
            name: 'text',
            context: '2d'
        };
        this.fontOptions = [
            'Arial',
            'Arimo',
            'Lato',
            'Merriweather',
            'Oswald',
            'Oxygen',
            'Raleway',
            'Roboto',
            'Roboto Condensed',
            'Times New Roman'
        ];
    },

    componentDidMount: function() {
        console.log('control mounted', this.config.name);
        this.canvas = this.refs.canvas.getDOMNode();
        this.text = new AstroFox.TextDisplay(this.canvas, this.state);
        this.props.onLoad(this)
    },

    handleChange: function(name, val) {
        var state = {};
        state[name] = val;
        this.setState(state);
        this.setState(state, function() {
            this.text.init(this.state);
            this.text.render();
        });
    },

    renderScene: function(canvas) {
        if (this.state.text == '') return;

        var context = canvas.getContext('2d'),
            state = this.state,
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
                <canvas ref="canvas" className="offScreen" />
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