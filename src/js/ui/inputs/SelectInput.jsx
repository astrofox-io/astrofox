'use strict';

const React = require('react');
const classNames = require('classnames');
const autoBind = require('../../util/autoBind.js');

class SelectInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

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
                    className={classNames('input-option', {'input-option-separator': item.separator})}
                    style={item.style}
                    onMouseDown={this.onItemClick.bind(this, item)}>
                    {item.name}
                </div>
            );
        }, this);

        return (
            <div className="input-select">
                <input
                    type="text"
                    className="input-field"
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
    size: 20,
    value: '',
    items: []
};

module.exports = SelectInput;