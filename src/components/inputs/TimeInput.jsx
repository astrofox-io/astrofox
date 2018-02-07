import React, { Component } from 'react';
import TextInput from 'components/inputs/TextInput';
import { formatSeekTime } from 'utils/format';
import { clamp } from 'utils/math.js';

export default class TimeInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps({ value }) {
        if (value !== undefined) {
            this.setState({ value });
        }
    }

    onChange = (name, val) => {
        const { value, min, max, onChange } = this.props;

        const regex = /^(0?\d+:)?(0?\d+):(\d{2}(\.\d{1,3})?)$/;

        let matches = val.match(regex);

        if (matches) {
            let h = ((matches[1] !== undefined) ? Number(matches[1].replace(':','')) * 3600 : 0),
                m = Number(matches[2]) * 60,
                s = Number(matches[3]);

            val = h + m + s;

            // Clamp to min/max
            if (min !== false && max !== false) {
                val = clamp(val, min, max);
            }

            // Send value to parent
            onChange(name, val);
        }
        // Reset to previous value
        else {
            this.setState({ value });
        }
    };

    render() {
        const {
            name,
            width,
            size,
            readOnly,
        } = this.props;

        const { value } = this.state;

        return (
            <TextInput
                name={name}
                width={width}
                size={size}
                buffered={true}
                readOnly={readOnly}
                value={formatSeekTime(value)}
                onChange={this.onChange}
            />
        );
    }
}

TimeInput.defaultProps = {
    name: 'time',
    width: 140,
    size: null,
    value: 0,
    readOnly: false,
    onChange: () => {}
};
