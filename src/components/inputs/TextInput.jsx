import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './TextInput.less';

export default class TextInput extends Component {
    static defaultProps = {
        name: 'text',
        width: 140,
        size: null,
        value: '',
        spellCheck: false,
        autoSelect: false,
        buffered: false,
        readOnly: false,
        disabled: false,
        onChange: () => {},
        onCancel: () => {},
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };
    }

    componentDidMount() {
        if (this.props.autoSelect) {
            this.textInput.select();
        }
    }

    componentWillReceiveProps({ value }) {
        if (value !== undefined) {
            this.setState({ value });
        }
    }

    onChange = (e) => {
        const { value } = e.target;
        const { name, buffered, onChange } = this.props;

        this.setState({ value });

        if (!buffered) {
            onChange(name, value);
        }
    }

    onValueChange = () => {
        const { name, onChange } = this.props;
        const { value } = this.state;

        onChange(name, value);
    }

    onKeyUp = (e) => {
        const { value, onCancel } = this.props;

        if (e.keyCode === 13) {
            this.onValueChange(e);
        }
        else if (e.keyCode === 27) {
            this.setState({ value });

            onCancel();
        }
    }

    render() {
        const {
            name,
            width,
            size,
            spellCheck,
            readOnly,
            disabled,
            className,
            inputClassName,
        } = this.props;

        const { value } = this.state;

        return (
            <div className={classNames(className)}>
                <input
                    ref={e => (this.textInput = e)}
                    type="text"
                    className={classNames(styles.text, inputClassName)}
                    style={{ width }}
                    name={name}
                    size={size}
                    spellCheck={spellCheck}
                    value={value}
                    onChange={this.onChange}
                    onBlur={this.onValueChange}
                    onKeyUp={this.onKeyUp}
                    readOnly={readOnly || disabled}
                />
            </div>
        );
    }
}
