import React from 'react';
import classNames from 'classnames';

import { styleProps } from 'utils/react';

export default class SelectInput extends React.Component {
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
        if (props.value !== undefined) {
            this.setState({ value: props.value });
        }
    }

    onClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.setState(prevState => ({ showItems: !prevState.showItems }));
    };

    onItemClick = (item) => {
        return () => {
            this.setState({showItems: false}, () => {
                this.props.onChange(this.props.name, item.value);
            });
        };
    };

    onBlur = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: false });
    };

    render() {
        let displayValue = '',
            state = this.state,
            props = this.props;


        let optionClasses = {
            'input-options': true,
            'display-none': !state.showItems
        };

        let items = props.items.map((item, index) => {
            if (typeof item !== 'object') {
                item = { name: item, value: item };
            }

            if (item.value === props.value) {
                displayValue = item.name;
            }

            return (
                <div
                    key={index}
                    className={classNames('input-option', {separator: item.separator})}
                    style={item.style}
                    onMouseDown={this.onItemClick(item)}>
                    {item.name}
                </div>
            );
        });

        return (
            <div className="input-select">
                <input
                    type="text"
                    className="input-field"
                    style={styleProps(props)}
                    name={props.name}
                    size={props.size}
                    value={displayValue}
                    onClick={this.onClick}
                    onBlur={this.onBlur}
                    readOnly="true"
                />
                <div className={classNames(optionClasses)}>
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