'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

class SelectInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            value: this.props.value,
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

    handleClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: !this.state.showItems });
    }

    handleItemClick(item) {
        this.setState({ showItems: false }, function(){
            this.props.onChange(this.props.name, item.value);
        }.bind(this));
    }

    handleBlur(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: false });
    }

    render() {
        let style = { display: this.state.showItems ? 'block' : 'none' };

        let items = this.props.items.map(function(item, index) {
            let key = this.props.name + '' + index,
                className = 'input-option';

            if (typeof item !== 'object') {
                item = { name: item, value: item, style: null, separator: false };
            }

            if (item.separator) className += ' input-option-separator';

            return (
                <li
                    className={className}
                    key={key}
                    style={item.style}
                    onMouseDown={this.handleItemClick.bind(this, item)}>
                    {item.name}
                </li>
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
                    onClick={this.handleClick}
                    onBlur={this.handleBlur}
                    readOnly
                />
                <ul
                    className="input-options"
                    style={style}>
                    {items}
                </ul>
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