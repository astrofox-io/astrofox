var ColorRangeInput = React.createClass({
    defaultColor: '#ffffff',

    getDefaultProps: function() {
        return {
            name: "color",
            startColor: this.defaultColor,
            endColor: this.defaultColor
        };
    },

    getInitialState: function() {
        return {
            startColor: this.props.startColor,
            endColor: this.props.endColor
        };
    },

    handleChange: function(name, val) {
        var obj = {};
        obj[name] = val;

        this.setState(obj, function() {
            this.props.onChange(this.props.name, this.getValues());
        }.bind(this));
    },

    getValues: function() {
        return [this.state.startColor, this.state.endColor];
    },

    render: function(){
        var colorRangeStyle = {
            backgroundImage: '-webkit-linear-gradient(left, '+this.state.startColor+','+this.state.endColor+')'
        };

        return (
            <div className="input-color-range flex">
                <ColorInput
                    name="startColor"
                    value={this.state.startColor}
                    onChange={this.handleChange}
                />
                <div className="input color-range flex" style={colorRangeStyle} />
                <ColorInput
                    name="endColor"
                    value={this.state.endColor}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
});
