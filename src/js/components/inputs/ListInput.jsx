import React from 'react';

import UIComponent from 'components/UIComponent';

export default class ListInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            values: []
        };
    }

    componentWillReceiveProps(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    }

    render() {
        let options = this.props.options.map((item, index) => {
            return (
                <option key={index} value={item.value}>{item.text}</option>
            );
        });

        return (
            <select name={this.props.name} className="input-field input-list" multiple="true">
                {options}
            </select>
        );
    }
}

ListInput.defaultProps = {
    name: 'list',
    options: []
};