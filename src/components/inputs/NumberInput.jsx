import React, { PureComponent } from 'react';
import classNames from 'classnames';
import TextInput from 'components/inputs/TextInput';
import { clamp, roundTo } from 'utils/math.js';
import styles from './NumberInput.less';

export default class NumberInput extends PureComponent {
    static defaultProps = {
        name: 'number',
        width: 40,
        value: 0,
        min: false,
        max: false,
        step: false,
        readOnly: false,
        onChange: () => {},
    }

    state = {
        key: 0,
    }

    onChange = (name, value) => {
        const {
            onChange,
            min,
            max,
            step,
        } = this.props;

        const regex = /^(0|-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

        // If valid number, send new value to parent
        if (regex.test(value)) {
            let newValue = +value;

            // Clamp to min/max
            if (min !== false && max !== false) {
                newValue = clamp(newValue, min, max);
            }

            // Round value to nearest interval
            if (step !== false) {
                newValue = roundTo(newValue, step);
            }

            onChange(name, newValue);
        }
        // Reset to old value
        else {
            this.setState(({ key }) => ({ key: key + 1 }));
        }
    }

    render() {
        const {
            name,
            value,
            width,
            className,
            readOnly,
        } = this.props;

        const { key } = this.state;

        return (
            <TextInput
                key={key}
                name={name}
                value={value}
                className={classNames(styles.input, className)}
                width={width}
                onChange={this.onChange}
                readOnly={readOnly}
                buffered
            />
        );
    }
}
