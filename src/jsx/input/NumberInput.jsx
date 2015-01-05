var NumberInput = React.createClass({
    getInitialState: function() {
        return { value: 0 };
    },

    getDefaultProps: function() {
        return {
            name: "number",
            size: 4,
            value: 0,
            min: null,
            max: null,
            step: null,
            allowDecimal: false,
            readOnly: false
        };
    },

    componentWillMount: function() {
        this.allowedProps = ['value', 'readOnly'];
    },

    componentDidMount: function() {
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        var state = {};
        this.allowedProps.forEach(function(prop){
            if (typeof props[prop] !== "undefined") {
                state[prop] = props[prop];
            }
        });
        this.setState({ value: props.value });
    },

    handleChange: function(e) {
        this.setState({ value: e.target.value });
    },

    handleValueChange: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = this.state.value,
            min = this.props.min,
            max = this.props.max,
            step = this.props.step;

        if (this.props.value !== val) {
            var regex = (this.props.allowDecimal === "true") ?
                /^(0|\-?[0-9]+\.[0-9]+)$/ :
                /^(0|\-?[1-9]+[0-9]*)$/;

            if (regex.test(val)) {
                if (step !== null && step > 0) {
                    val = Math.round(val / step) * step;
                }

                if (min !== null && val < min) {
                    val = min;
                }
                else if (max !== null && val > max) {
                    val = max;
                }

                this.props.onChange(this.props.name, Number(val));
            }
            else {
                this.setState({value: this.props.value});
            }
        }
    },

    handleKeyUp: function(e) {
        e.stopPropagation();
        e.preventDefault();

        if (e.keyCode === 13) {
            this.handleValueChange(e);
        }
    },

    render: function(){
        return (
            <div className="input">
                <input type="text"
                    className="input-field"
                    name={this.props.name}
                    size={this.props.size}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onBlur={this.handleValueChange}
                    onKeyUp={this.handleKeyUp}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
});