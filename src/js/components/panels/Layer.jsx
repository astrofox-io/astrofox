import React from 'react';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';
import TextInput from 'components/inputs/TextInput';

export default class Layer extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = {
            edit: false
        };
    }

    onLayerClick(e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.onLayerClick) {
            this.props.onLayerClick(this.props.index);
        }
    }

    onEnableClick(e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.onLayerUpdate) {
            this.props.onLayerUpdate(this.props.index, 'enabled', !this.props.enabled);
        }
    }

    onNameChange(name, val) {
        if (val.length > 0) {
            if (this.props.onLayerUpdate) {
                this.props.onLayerUpdate(this.props.index, name, val);
            }
            this.cancelEdit();
        }
    }
    
    enableEdit() {
        this.setState({ edit: true });
    }

    cancelEdit() {
        this.setState({ edit: false });
    }

    render() {
        let text,
            state = this.state,
            props = this.props,
            classes = classNames({
                'layer': true,
                'child': props.control,
                'edit': state.edit,
                'active': props.active
            });

        if (state.edit) {
            text = (
                <TextInput
                    name="displayName"
                    value={props.name}
                    buffered={true}
                    autoFocus={true}
                    autoSelect={true}
                    onChange={this.onNameChange}
                    onCancel={this.cancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.enableEdit}>
                    {props.name}
                </span>
            );
        }

        return (
            <div className={classes} onClick={this.onLayerClick}>
                <span className={classNames('icon', props.icon)}/>
                {text}
                <span
                    className={classNames('options-icon icon-eye', {'disabled': !props.enabled})}
                    onClick={this.onEnableClick}
                />
            </div>
        );
    }
}

Layer.defaultProps = {
    name: '',
    index: -1,
    icon: null,
    control: false,
    active: false,
    enabled: true,
    onLayerClick: null,
    onLayerUpdate: null
};