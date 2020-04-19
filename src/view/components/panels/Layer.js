import React, { useState } from 'react';
import classNames from 'classnames';
import TextInput from 'components/inputs/TextInput';
import Icon from 'components/interface/Icon';
import iconVisible from 'assets/icons/eye.svg';
import styles from './Layer.less';

export default function Layer({
  id,
  name = '',
  icon = null,
  className = null,
  active = false,
  enabled = true,
  onLayerClick = () => {},
  onLayerUpdate = () => {},
}) {
  const [edit, setEdit] = useState(false);

  function handleLayerClick() {
    onLayerClick(id);
  }

  function handleEnableClick() {
    onLayerUpdate(id, 'enabled', !enabled);
  }

  function handleNameChange(name, val) {
    if (val.length > 0) {
      onLayerUpdate(id, name, val);
    }
    setEdit(false);
  }

  function handleEnableEdit(e) {
    e.stopPropagation();
    setEdit(true);
  }

  function handleCancelEdit() {
    setEdit(false);
  }

  return (
    <div
      className={classNames(styles.layer, className, {
        [styles.edit]: edit,
        [styles.active]: active,
      })}
      onClick={handleLayerClick}
    >
      {icon && <Icon className={styles.icon} glyph={icon} />}
      {edit ? (
        <TextInput
          name="displayName"
          value={name}
          buffered
          autoFocus
          autoSelect
          onChange={handleNameChange}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className={styles.text} onDoubleClick={handleEnableEdit}>
          {name}
        </div>
      )}
      <span onClick={handleEnableClick}>
        <Icon
          className={classNames({
            [styles.propertiesIcon]: true,
            [styles.disabled]: !enabled,
          })}
          glyph={iconVisible}
        />
      </span>
    </div>
  );
}
