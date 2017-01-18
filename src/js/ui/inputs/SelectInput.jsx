import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';

export default class SelectInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            showItems: false
        };
    }

    componentDidMount() {
        this.setState({ value: this.props.value });
    }

    componentWillReceiveProps(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    }

    onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: !this.state.showItems });
    }

    onItemClick(item) {
        this.setState({ showItems: false }, () => {
            this.props.onChange(this.props.name, item.value);
        });
    }

    onBlur(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: false });
    }

    render() {
        let style = { display: this.state.showItems ? 'block' : 'none' };

        let items = this.props.items.map((item, index) => {
            if (typeof item !== 'object') {
                item = { name: item, value: item, style: null, separator: false };
            }

            return (
                <div
                    key={index}
                    className={classNames('input-option', {separator: item.separator})}
                    style={item.style}
                    onMouseDown={this.onItemClick.bind(this, item)}>
                    {item.name}
                </div>
            );
        });

        return (
            <div className="input-select">
                <input
                    type="text"
                    className="input-field"
                    style={{width: this.props.width}}
                    name={this.props.name}
                    size={this.props.size}
                    value={this.state.value}
                    onClick={this.onClick}
                    onBlur={this.onBlur}
                    readOnly="true"
                />
                <div
                    className="input-options"
                    style={style}>
                    {items}
                </div>
            </div>
        );
    }
}

SelectInput.defaultProps = {
    name: 'select',
    width: 140,
    size: null,
    value: '',
    items: []
};