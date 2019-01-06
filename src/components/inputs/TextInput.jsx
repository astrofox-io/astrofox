import React, { PureComponent } from 'react';
import classNames from 'classnames';
import styles from './TextInput.less';

export default class TextInput extends PureComponent {
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
    }

    state = {
        value: this.props.value,
        initialValue: this.props.value,
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value !== state.initialValue) {
            return { value: props.value, initialValue: props.value };
        }
        return null;
    }

    componentDidMount() {
        if (this.props.autoSelect) {
            this.input.select();
        }
    }

    handleChange = (e) => {
        const { name, buffered, onChange } = this.props;
        const { value } = e.currentTarget;

        this.setState({ value }, () => {
            if (!buffered) {
                onChange(name, value);
            }
        });
    }

    handleKeyUp = (e) => {
        const { name, buffered, onChange } = this.props;
        const { value } = this.state;

        if (buffered) {
            // Enter key
            if (e.keyCode === 13) {
                onChange(name, value);
            }
            // Esc key
            else if (e.keyCode === 27) {
                this.resetValue();
            }
        }
    }

    handleBlur = () => {
        const { name, buffered, onChange } = this.props;
        const { value } = this.state;

        if (buffered) {
            onChange(name, value);
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
        } = this.props;

        const { value } = this.state;

        return (
            <input
                ref={ref => (this.input = ref)}
                type="text"
                className={classNames(styles.text, className)}
                style={{ width }}
                name={name}
                size={size}
                spellCheck={spellCheck}
                value={value}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                onKeyUp={this.handleKeyUp}
                readOnly={readOnly}
                disabled={disabled}
            />
        );
    }
}
