import React, { Component } from 'react';

export default function DisplayControl(ControlComponent) {
    return class DisplayControlComponent extends Component {
        constructor(props) {
            super(props);

            this.state = props.display.options;
        }

        onChange = (name, value, data) => {
            const obj = Object.assign({[name]: value}, data);

            this.setState(obj);

            this.props.display.update(obj);
        }

        onReactorChange = (name, options) => {
            this.props.display.setReactor(name, options);

            this.forceUpdate();
        }

        render() {
            return (
                <ControlComponent
                    onChange={this.onChange}
                    onReactorChange={this.onReactorChange}
                    {...this.props}
                    {...this.state}
                />
            );
        }
    };
}