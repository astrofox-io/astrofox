import React, { PureComponent } from 'react';
import classNames from 'classnames';
import TextInput from 'components/inputs/TextInput';
import Icon from 'components/interface/Icon';
import iconVisible from 'svg/icons/eye.svg';
import styles from './Layer.less';

export default class Layer extends PureComponent {
  static defaultProps = {
    name: '',
    index: -1,
    icon: null,
    control: false,
    active: false,
    enabled: true,
    onLayerClick: null,
    onLayerUpdate: null,
  };

  state = {
    edit: false,
  };

  handleLayerClick = () => {
    const { index, onLayerClick } = this.props;

    if (onLayerClick) {
      onLayerClick(index);
    }
  };

  handleEnableClick = () => {
    const { index, enabled, onLayerUpdate } = this.props;

    if (onLayerUpdate) {
      onLayerUpdate(index, 'enabled', !enabled);
    }
  };

  handleNameChange = (name, val) => {
    const { index, onLayerUpdate } = this.props;

    if (val.length > 0) {
      if (onLayerUpdate) {
        onLayerUpdate(index, name, val);
      }
      this.handleCancelEdit();
    }
  };

  handleEnableEdit = () => {
    this.setState({ edit: true });
  };

  handleCancelEdit = () => {
    this.setState({ edit: false });
  };

  render() {
    const { edit } = this.state;
    const { name, control, active, enabled, icon } = this.props;

    return (
      <div
        className={classNames({
          [styles.layer]: true,
          [styles.child]: control,
          [styles.edit]: edit,
          [styles.active]: active,
        })}
        onClick={this.handleLayerClick}
      >
        <Icon className={styles.icon} glyph={icon} />
        {edit ? (
          <TextInput
            name="displayName"
            value={name}
            buffered
            autoFocus
            autoSelect
            onChange={this.handleNameChange}
            onCancel={this.handleCancelEdit}
          />
        ) : (
          <div className={styles.text} onDoubleClick={this.handleEnableEdit}>
            {name}
          </div>
        )}
        <span onClick={this.handleEnableClick}>
          <Icon
            className={classNames({
              [styles.optionsIcon]: true,
              [styles.disabled]: !enabled,
            })}
            glyph={iconVisible}
          />
        </span>
      </div>
    );
  }
}
