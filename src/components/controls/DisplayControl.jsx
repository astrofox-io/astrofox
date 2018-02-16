import React, { Component } from 'react';

export default function DisplayControl(ControlComponent) {
    return class extends Component {
        constructor(props) {
            super(props);

            this.state = props.display.options;
        }

        onChange = (name, value, data) => {
            const { display } = this.props;
            const obj = Object.assign({ [name]: value }, data);

            this.setState(obj);

            display.update(obj);
        }

        render() {
            return (
                <ControlComponent
                    onChange={this.onChange}
                    {...this.props}
                    {...this.state}
                />
            );
        }
    };
}
