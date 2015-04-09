var TextInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: 'text',
            size: 20,
            value: '',
            spellcheck: false,
            buffered: false
        };
    },

    getInitialState: function() {
        return {
            value: this.props.value
        };
    },

    componentDidMount: function() {
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    },

    handleChange: function(e) {
        var val = e.target.value;
        this.setState({ value: val });

        if (!this.props.buffered) {
            this.props.onChange(this.props.name, val);
        }
    },

    handleValueChange: function(e) {
        var val = this.state.value;
        if (this.props.value !== val) {
            this.props.onChange(this.props.name, val);
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
                    spellCheck={this.props.spellcheck}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onBlur={this.handleValueChange}
                    onKeyUp={this.handleKeyUp}
                />
            </div>
        );
    }
});