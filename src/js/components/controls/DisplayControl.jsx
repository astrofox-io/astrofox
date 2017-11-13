import React from 'react';

export default function DisplayControl(Component) {
    return class DisplayControlComponent extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = props.display.options;

            this.onChange = this.onChange.bind(this);
            this.onReactorChange = this.onReactorChange.bind(this);
        }

        onChange(name, value, data) {
            const obj = Object.assign({[name]: value}, data);

            this.setState(obj);

            this.props.display.update(obj);
        }

        onReactorChange(name, options) {
            this.props.display.setReactor(name, options);

            this.forceUpdate();
        }

        render() {
            return (
                <Component
                    onChange={this.onChange}
                    onReactorChange={this.onReactorChange}
                    {...this.props}
                    {...this.state}
                />
            );
        }
    };
}