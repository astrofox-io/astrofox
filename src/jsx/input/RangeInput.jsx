var RangeInput = React.createClass({
    getInitialState: function() {
        return {
            value: 0
        };
    },

    getDefaultProps: function() {
        return {
            name: "range",
            min: 0,
            max: 100,
            step: 1,
            buffered: false,
            onChange: function(){},
            onUpdate: function(){}
        };
    },

    componentDidMount: function() {
        this.active = false;
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        if (typeof this.props.value !== "undefined" && !this.active) {
            this.setState({value: props.value});
        }
    },

    handleChange: function(e) {
        var val = e.currentTarget.value;
        this.setState({ value: val }, function() {
            if (!this.props.buffered) {
                this.props.onChange(this.props.name, Number(val));
            }
            this.props.onUpdate(this.props.name, Number(val));
        }.bind(this));
    },

    handleMouseDown: function(e) {
        if (this.props.buffered) {
            this.active = true;
        }
    },

    handleMouseUp: function(e) {
        if (this.props.buffered) {
            var val = e.currentTarget.value;
            this.props.onChange(this.props.name, Number(val));
            this.active = false;
        }
    },

    isActive: function() {
        return this.active;
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
                    onChange={this.handleChange}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                />
            </div>
        );
    }
});