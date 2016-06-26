'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            value: props.value
        };
    }

    componentDidMount() {
        this.setState({ value: this.props.value });

        if (this.props.autoSelect) {
            this.refs.input.select();
        }
    }

    componentWillReceiveProps(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    }

    handleChange(e) {
        var val = e.target.value;
        this.setState({ value: val });

        if (this.props.onChange && !this.props.buffered) {
            this.props.onChange(this.props.name, val);
        }
    }

    handleValueChange(e) {
        var val = this.state.value;

        if (this.props.onChange) {
            this.props.onChange(this.props.name, val);
        }
    }

    handleKeyUp(e) {
        if (e.keyCode === 13) {
            this.handleValueChange(e);
        }
        else if (e.keyCode === 27) {
            this.setState({ value: this.props.value });

            if (this.props.onCancel) {
                this.props.onCancel();
            }
        }
    }

    render() {
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
}

TextInput.defaultProps = {
    name: 'text',
    size: 20,
    value: '',
    spellCheck: false,
    autoFocus: false,
    autoSelect: false,
    buffered: false
};

module.exports = TextInput;