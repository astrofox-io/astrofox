var RangeInput = React.createClass({
    getInitialState: function() {
        return { value: 0 };
    },

    getDefaultProps: function() {
        return {
            name: "range",
            min: 0,
            max: 100,
            step: 1,
            width: "auto"
        };
    },

    componentDidMount: function() {
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        if (typeof this.props.value !== "undefined") {
            this.setState({value: props.value});
        }
    },

    handleChange: function(e) {
        var val = e.currentTarget.value;
        this.setState({ value: val }, function() {
            this.props.onChange(this.props.name, Number(val));
        }.bind(this));
    },

    render: function() {
        var min = this.props.min,
            max = this.props.max,
            val = this.state.value,
            step = this.props.step,
            fillStyle = { width: ((val - min)/(max - min) * 100)+'%' };

        return (
            <div className="input-range">
                <div className="track"></div>
                <div className="fill" style={fillStyle}></div>
                <input type="range"
                    name={this.props.name}
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={this.handleChange} />
            </div>
        );
    }
});