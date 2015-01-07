var ColorRangeInput = React.createClass({
    getInitialState: function() {
        return {
            startColor: "#ffffff",
            endColor: "#000000"
        };
    },

    getDefaultProps: function() {
        return {
            name: "color",
            value: ["#ffffff","#000000"]
        };
    },

    componentDidMount: function() {
        this.setState({
            startColor: this.props.value[0],
            endColor: this.props.value[1]
        });
    },

    componentWillReceiveProps: function(props) {
        this.setState({
            startColor: props.value[0],
            endColor: props.value[1]
        });
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
        var style = {
            backgroundImage: '-webkit-linear-gradient(left, '+this.state.startColor+','+this.state.endColor+')'
        };

        return (
            <div className="input-color-range flex">
                <ColorInput
                    name="startColor"
                    value={this.state.startColor}
                    onChange={this.handleChange}
                />
                <div className="input color-range flex" style={style}></div>
                <ColorInput
                    name="endColor"
                    value={this.state.endColor}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
});
