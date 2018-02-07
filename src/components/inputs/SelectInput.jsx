import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './SelectInput.less';

export default class SelectInput extends Component {
    static defaultProps = {
        name: 'select',
        width: 140,
        value: '',
        items: [],
        displayField: 'name',
        valueField: 'value',
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            showItems: false
        };
    }

    componentWillReceiveProps({ value }) {
        if (value !== undefined) {
            this.setState({ value });
        }
    }

    onClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.setState(({ showItems }) => ({ showItems: !showItems }));
    }

    onItemClick = (value) => () => {
        const { name, onChange } = this.props;

        this.setState({ showItems: false });

        onChange(name, value);
    }

    onBlur = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: false });
    }

    getDisplayText() {
        const { items, displayField, valueField } = this.props;
        const { value } = this.state;
        let text = '';

        items.forEach(item => {
            if (text.length === 0 && item[valueField] === value) {
                text = item[displayField];
            }
        });

        return text;
    }

    render() {
        const { items, name, width, className, displayField, valueField } = this.props;
        const { showItems } = this.state;

        return (
            <div className={styles.select}>
                <input
                    type="text"
                    className={classNames(styles.input, className)}
                    name={name}
                    style={{width}}
                    value={this.getDisplayText()}
                    onClick={this.onClick}
                    onBlur={this.onBlur}
                    readOnly="true"
                />
                <div className={classNames({
                    [styles.options]: true,
                    [styles.hidden]: !showItems
                })}>
                    {
                        items.map((item, index) => (
                            <div
                                key={index}
                                className={classNames({
                                    [styles.option]: true,
                                    [styles.separator]: item.separator,
                                })}
                                style={item.style}
                                onMouseDown={this.onItemClick(item[valueField])}>
                                {item[displayField]}
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
