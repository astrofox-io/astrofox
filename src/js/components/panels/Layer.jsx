import React from 'react';
import classNames from 'classnames';

import TextInput from 'components/inputs/TextInput';
import Icon from 'components/interface/Icon';

import iconVisible from 'svg/icons/eye.svg';

export default class Layer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            edit: false
        };
    }

    onLayerClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.onLayerClick) {
            this.props.onLayerClick(this.props.index);
        }
    };

    onEnableClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.onLayerUpdate) {
            this.props.onLayerUpdate(this.props.index, 'enabled', !this.props.enabled);
        }
    };

    onNameChange = (name, val) => {
        if (val.length > 0) {
            if (this.props.onLayerUpdate) {
                this.props.onLayerUpdate(this.props.index, name, val);
            }
            this.onCancelEdit();
        }
    };
    
    onEnableEdit = () => {
        this.setState({ edit: true });
    };

    ononCancelEdit = () => {
        this.setState({ edit: false });
    };

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
                    onCancel={this.onCancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.onEnableEdit}>
                    {props.name}
                </span>
            );
        }

        return (
            <div className={classes} onClick={this.onLayerClick}>
                <Icon className="icon" glyph={props.icon} />
                {text}
                <span onClick={this.onEnableClick}>
                    <Icon
                        className={classNames('options-icon icon-eye', {'disabled': !props.enabled})}
                        glyph={iconVisible}

                    />
                </span>
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