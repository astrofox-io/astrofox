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
  };

  state = {
    showItems: false,
  };

  handleClick = () => {
    this.setState(({ showItems }) => ({ showItems: !showItems }));
  };

  handleItemClick = value => () => {
    const { name, onChange } = this.props;

    this.setState({ showItems: false });

    onChange(name, value);
  };

  handleBlur = () => {
    this.setState({ showItems: false });
  };

  getDisplayText() {
    const { value, items, displayField, valueField } = this.props;
    const parsedItems = this.parseItems(items);
    let text = '';

    parsedItems.forEach(item => {
      if (text.length === 0 && item[valueField] === value) {
        text = item[displayField];
      }
    });

    return text;
  }

  parseItems(items) {
    return items.map(item => {
      if (typeof item !== 'object') {
        const { displayField, valueField } = this.props;
        return { [displayField]: item, [valueField]: item };
      }
      return item;
    });
  }

  render() {
    const { items, name, width, className, displayField, valueField } = this.props;
    const { showItems } = this.state;
    const parsedItems = this.parseItems(items);

    return (
      <div className={styles.select}>
        <input
          type="text"
          className={classNames(styles.input, className)}
          name={name}
          style={{ width }}
          value={this.getDisplayText()}
          onClick={this.handleClick}
          onBlur={this.handleBlur}
          readOnly
        />
        <div
          className={classNames({
            [styles.options]: true,
            [styles.hidden]: !showItems,
          })}
        >
          {parsedItems.map((item, index) => (
            <div
              role="presentation"
              key={index}
              className={classNames({
                [styles.option]: true,
                [styles.separator]: item.separator,
              })}
              style={item.style}
              onMouseDown={this.handleItemClick(item[valueField])}
            >
              {item[displayField]}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
