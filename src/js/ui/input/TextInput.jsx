'use strict';

var React = require('react');

var TextInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: 'text',
            size: 20,
            value: '',
            spellCheck: false,
            autoFocus: false,
            autoSelect: false,
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

        if (this.props.autoSelect) {
            React.findDOMNode(this.refs.input).select();
        }
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    },

    handleChange: function(e) {
        var val = e.target.value;
        this.setState({ value: val });

        if (this.props.onChange && !this.props.buffered) {
            this.props.onChange(this.props.name, val);
        }
    },

    handleValueChange: function(e) {
        var val = this.state.value;

        if (this.props.onChange) {
            this.props.onChange(this.props.name, val);
        }
    },

    handleKeyUp: function(e) {
        if (e.keyCode === 13) {
            this.handleValueChange(e);
        }
        else if (e.keyCode === 27) {
            this.setState({ value: this.props.value });

            if (this.props.onCancel) {
                this.props.onCancel();
            }
        }
    },

    render: function(){
        return (
            <div className="input">
                <input
                    ref="input"
                    type="text"
                    className="input-field"
                    name={this.props.name}
                    size={this.props.size}
                    spellCheck={this.props.spellCheck}
                    autoFocus={this.props.autoFocus}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onBlur={this.handleValueChange}
                    onKeyUp={this.handleKeyUp}
                />
            </div>
        );
    }
});

module.exports = TextInput;