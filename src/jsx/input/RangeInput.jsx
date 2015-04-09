var RangeInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: "range",
            min: 0,
            max: 100,
            step: 1,
            buffered: false,
            readOnly: false
        };
    },

    getInitialState: function() {
        return {
            value: this.props.value
        };
    },

    componentDidMount: function() {
        this.active = false;
    },

    componentWillReceiveProps: function(props) {
        if (typeof this.props.value !== "undefined" && !this.active) {
            this.setState({ value: props.value });
        }
    },

    handleChange: function(e) {
        var val = e.currentTarget.value;
        this.setState({ value: val }, function() {
            if (!this.props.buffered && this.props.onChange) {
                this.props.onChange(this.props.name, Number(val));
            }

            if (this.props.onUpdate) {
                this.props.onUpdate(this.props.name, Number(val));
            }
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

    getPosition: function() {
        var min = this.props.min,
            max = this.props.max,
            val = this.state.value;

        if (max > min) {
            return ((val - min) / (max - min) * 100);
        }
        return 0;
    },

    render: function() {
        var props = this.props,
            fillStyle = { width: + this.getPosition() + '%' };

        return (
            <div className="input-range">
                <div className="track" />
                <div className="fill" style={fillStyle} />
                <input
                    className="range"
                    type="range"
                    name={props.name}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    readOnly={props.readOnly}
                />
            </div>
        );
    }
});