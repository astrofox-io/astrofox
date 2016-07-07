'use strict';

const React = require('react');
const classNames = require('classnames');

const autoBind = require('../../util/autoBind.js');

const TextInput = require('../inputs/TextInput.jsx');

class Layer extends React.Component {
    constructor(props) {
        super(props);

        autoBind(this);

        this.state = {
            edit: false
        };
    }

    onLayerClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onLayerClick(this.props.index);
    }

    onEnableClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onLayerUpdate(this.props.index, 'enabled', !this.props.enabled);
    }

    onNameChange(name, val) {
        if (val.length > 0) {
            this.props.onLayerUpdate(this.props.index, name, val);
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
        let text, icon,
            state = this.state,
            props = this.props,
            classes = classNames({
                'layer': true,
                'layer-control': props.control,
                'layer-edit': state.edit,
                'layer-active': props.active
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
                <i className={classNames('layer-icon', props.icon)}/>
                {text}
                <i className={classNames('layer-options-icon', 'icon-eye', {'layer-disabled': !props.enabled})}
                   onClick={this.onEnableClick}/>
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
    onLayerUpdate: () => {}
};

module.exports = Layer;