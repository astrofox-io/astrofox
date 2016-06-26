'use strict';

const React = require('react');
const classNames = require('classnames');

const Application = require('../../core/Application.js');
const Display = require('../../display/Display.js');
const CanvasDisplay = require('../../display/CanvasDisplay.js');
const Stage = require('../../display/Stage.js');
const Scene = require('../../display/Scene.js');
const Effect = require('../../effects/Effect.js');
const DisplayLibrary = require('../../lib/DisplayLibrary.js');
const EffectsLibrary = require('../../lib/EffectsLibrary.js');
const autoBind = require('../../util/autoBind.js');

const TextInput = require('../inputs/TextInput.jsx');
const ControlPickerWindow = require('../windows/ControlPickerWindow.jsx');
const MenuPanel = require('./MenuPanel.jsx');

class LayersPanel extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            activeIndex: 0,
            editIndex: -1,
            layers: []
        };
    }

    componentWillMount() {
        this.updateLayers();
    }

    handleLayerClick(index) {
        let state = this.state,
            props = this.props,
            editIndex = (index == state.editIndex) ? state.editIndex: -1;

        this.setState({activeIndex: index, editIndex: editIndex}, function(){
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        }.bind(this));
    }

    handleDoubleClick(index) {
        if (index !== this.state.editIndex) {
            this.setState({editIndex: index});
        }
    }

    handleLayerEdit(val) {
        let layer = this.getActiveLayer();

        layer.options.displayName = val;

        this.cancelEdit();
    }

    handleLayerNameChange(index, name, val) {
        if (val.length > 0) {
            this.handleLayerEdit(val, index);
        }
    }

    handleLayerEnabled(obj, e) {
        e.stopPropagation();
        e.preventDefault();

        let props = this.props;

        obj.update({enabled: !obj.options.enabled});

        this.forceUpdate(function() {
            if (props.onLayerChanged) {
                props.onLayerChanged(obj);
            }
        });
    }

    handleAddSceneClick() {
        let scene = new Scene(),
            props = this.props;

        Application.stage.addScene(scene);

        this.updateLayers(function() {
            this.setActiveLayer(scene);

            if (props.onLayerAdded) {
                props.onLayerAdded(scene);
            }
        }.bind(this));
    }

    handleAddDisplayClick() {
        let scene = this.getActiveScene();

        if (scene) {
            Application.emit(
                'show_modal',
                <ControlPickerWindow title="ADD DISPLAY" scene={scene} items={DisplayLibrary} />
            );
        }
    }

    handleAddEffectClick() {
        let scene = this.getActiveScene();

        if (scene) {
            Application.emit(
                'show_modal',
                <ControlPickerWindow title="ADD EFFECT" scene={scene} items={EffectsLibrary} />
            );
        }
    }

    handleRemoveClick() {
        let state = this.state,
            props = this.props,
            index = this.state.activeIndex,
            layers = state.layers,
            layer = layers[index],
            last = layers.length - 1;

        if (Application.stage.hasScenes() && layer) {
            if (layer instanceof Scene) {
                layer.owner.removeScene(layer);
            }
            else {
                layer.owner.removeElement(layer);
            }

            this.updateLayers(function(){
                if (index === last) {
                    this.setState({activeIndex: last - 1});
                }
            });

            if (props.onLayerRemoved) {
                props.onLayerRemoved();
            }
        }
    }

    handleMoveUpClick() {
        this.moveLayer(1);
    }

    handleMoveDownClick() {
        this.moveLayer(-1);
    }

    cancelEdit() {
        this.setState({ editIndex: -1 });
    }

    getActiveLayer() {
        let state = this.state;

        return state.layers[state.activeIndex];
    }

    getActiveScene() {
        let layer = this.getActiveLayer();

        return (this.state.activeIndex >= 0) ? ((layer instanceof Scene) ? layer : layer.owner) : null;
    }

    setActiveLayer(obj) {
        if (typeof obj === 'undefined') return;

        let props = this.props,
            index = (typeof obj === 'number') ? obj : this.state.layers.indexOf(obj);

        this.setState({ activeIndex: index }, function(){
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        });
    }

    getLayerComponent(obj, index) {
        let text, icon,
            state = this.state,
            classes = classNames({
                'layer': true,
                'layer-control': !(obj instanceof Scene),
                'layer-edit': index === this.state.editIndex,
                'layer-active': index === this.state.activeIndex
            });

        if (state.editIndex === index) {
            text = (
                <TextInput
                    value={obj.options.displayName}
                    buffered={true}
                    autoFocus={true}
                    autoSelect={true}
                    onChange={this.handleLayerNameChange.bind(this, index)}
                    onCancel={this.cancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.handleDoubleClick.bind(this, index)}>
                    {obj.options.displayName}
                </span>
            );
        }

        if (obj instanceof Scene) {
            icon = 'icon-picture';
        }
        else if (obj instanceof CanvasDisplay) {
            icon = 'icon-document-landscape';
        }
        else if (obj instanceof Effect) {
            icon = 'icon-light-up';
        }
        else if (obj instanceof Display) {
            icon = 'icon-cube';
        }

        return (
            <div key={obj.toString()}
                 className={classes}
                 onClick={this.handleLayerClick.bind(this, index)}>
                <i className={classNames('layer-icon', icon)} />
                {text}
                <i className={classNames('layer-options-icon', 'icon-eye', {'layer-disabled': !obj.options.enabled})}
                   onClick={this.handleLayerEnabled.bind(this, obj)} />
            </div>
        );
    }

    updateLayers(callback) {
        let layers = [];

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            layers.push(scene);

            scene.effects.nodes.reverse().forEach(function(effect) {
                layers.push(effect);
            }, this);

            scene.displays.nodes.reverse().forEach(function(display) {
                layers.push(display);
            }, this);
        }, this);

        this.setState({ layers: layers }, callback);
    }

    moveLayer(direction) {
        let index, layer,
            props = this.props,
            scene = this.getActiveScene();

        if (scene) {
            layer = this.getActiveLayer();

            if (layer instanceof Scene) {
                layer.owner.shiftScene(layer, direction);
            }
            else {
                layer.owner.shiftElement(layer, direction);
            }

            this.updateLayers(function() {
                index = this.state.layers.indexOf(layer);

                this.setState({activeIndex: index});

                props.onLayerMoved(this.getActiveLayer());
            }.bind(this));
        }
    }

    render() {
        let layers,
            classes = { 'button': true, 'button-disabled': !Application.stage.hasScenes() };

        layers = this.state.layers.map(function(layer, index) {
            return this.getLayerComponent(layer, index);
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="button-group">
                    <li className="button icon-picture" title="Add Scene" onClick={this.handleAddSceneClick} />
                    <li className={classNames(classes, 'icon-cube')} title="Add Display" onClick={this.handleAddDisplayClick} />
                    <li className={classNames(classes, 'icon-light-up')} title="Add Effect" onClick={this.handleAddEffectClick} />
                    <li className={classNames(classes, 'icon-chevron-up')} title="Move Layer Up" onClick={this.handleMoveUpClick} />
                    <li className={classNames(classes, 'icon-chevron-down')} title="Move Layer Down" onClick={this.handleMoveDownClick} />
                    <li className={classNames(classes, 'icon-trash-empty')} title="Delete Layer" onClick={this.handleRemoveClick} />
                </ul>
            </div>
        );
    }
}

module.exports = LayersPanel;