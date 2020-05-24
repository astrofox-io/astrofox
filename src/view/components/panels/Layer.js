import React, { useState } from 'react';
import classNames from 'classnames';
import TextInput from 'components/inputs/TextInput';
import Icon from 'components/interface/Icon';
import { Eye } from 'view/icons';
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
      <div className={styles.text} onDoubleClick={handleEnableEdit}>
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
          name
        )}
      </div>
      <Icon
        className={classNames(styles.enableIcon, {
          [styles.disabled]: !enabled,
        })}
        glyph={Eye}
        onClick={handleEnableClick}
      />
    </div>
  );
}
