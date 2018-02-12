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
    }

    state = {
        edit: false,
    }

    onLayerClick = (e) => {
        const { index, onLayerClick } = this.props;

        e.stopPropagation();
        e.preventDefault();

        if (onLayerClick) {
            onLayerClick(index);
        }
    }

    onEnableClick = (e) => {
        const { index, enabled, onLayerUpdate } = this.props;

        e.stopPropagation();
        e.preventDefault();

        if (onLayerUpdate) {
            onLayerUpdate(index, 'enabled', !enabled);
        }
    }

    onNameChange = (name, val) => {
        const { index, onLayerUpdate } = this.props;

        if (val.length > 0) {
            if (onLayerUpdate) {
                onLayerUpdate(index, name, val);
            }
            this.onCancelEdit();
        }
    }

    onEnableEdit = () => {
        this.setState({ edit: true });
    }

    onCancelEdit = () => {
        this.setState({ edit: false });
    }

    render() {
        const { edit } = this.state;
        const {
            name, control, active, enabled, icon,
        } = this.props;

        return (
            <div
                className={classNames({
                    [styles.layer]: true,
                    [styles.child]: control,
                    [styles.edit]: edit,
                    [styles.active]: active,
                })}
                onClick={this.onLayerClick}
            >
                <Icon className={styles.icon} glyph={icon} />
                {
                    edit ? (
                        <TextInput
                            name="displayName"
                            value={name}
                            buffered
                            autoFocus
                            autoSelect
                            onChange={this.onNameChange}
                            onCancel={this.onCancelEdit}
                        />
                    ) : (
                        <span onDoubleClick={this.onEnableEdit}>
                            {name}
                        </span>
                    )
                }
                <span onClick={this.onEnableClick}>
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
