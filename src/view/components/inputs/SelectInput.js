import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import styles from './SelectInput.less';

export const SEPARATOR = {};

export default function SelectInput({
  name = 'select',
  value = '',
  items = [],
  displayField = 'name',
  valueField = 'value',
  width = 140,
  className,
  onChange = () => {},
}) {
  const [showItems, setShowItems] = useState(false);
  const parsedItems = useMemo(() => {
    return items.map(item => {
      if (typeof item !== 'object') {
        return { [displayField]: item, [valueField]: item };
      }
      return item;
    });
  }, [items]);

  function handleInputClick() {
    setShowItems(state => !state);
  }

  function handleItemClick(value) {
    return () => {
      setShowItems(false);

      onChange(name, value);
    };
  }

  function handleBlur() {
    setShowItems(false);
  }

  function getDisplayText() {
    let text = '';

    parsedItems.forEach(item => {
      if (text.length === 0 && item[valueField] === value) {
        text = item[displayField];
      }
    });

    return text;
  }

  return (
    <div className={styles.select}>
      <input
        type="text"
        className={classNames(styles.input, className, { [styles.active]: showItems })}
        name={name}
        style={{ width }}
        value={getDisplayText()}
        onClick={handleInputClick}
        onBlur={handleBlur}
        readOnly
      />
      <div
        className={classNames(styles.properties, {
          [styles.hidden]: !showItems,
        })}
      >
        {parsedItems.map((item, index) => (
          <div
            key={index}
            className={classNames(styles.option, {
              [styles.separator]: item === SEPARATOR,
            })}
            style={item.style}
            onMouseDown={handleItemClick(item === SEPARATOR ? null : item[valueField])}
          >
            {item[displayField]}
          </div>
        ))}
      </div>
    </div>
  );
}
