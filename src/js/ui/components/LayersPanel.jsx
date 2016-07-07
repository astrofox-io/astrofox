'use strict';

const React = require('react');
const classNames = require('classnames');

const { Events } = require('../../core/Global.js');
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

    onLayerClick(index) {
        let state = this.state,
            props = this.props,
            editIndex = (index == state.editIndex) ? state.editIndex: -1;

        this.setState({activeIndex: index, editIndex: editIndex}, () => {
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        });
    }

    onDoubleClick(index) {
        if (index !== this.state.editIndex) {
            this.setState({editIndex: index});
        }
    }

    onLayerEdit(val) {
        let layer = this.getActiveLayer();

        layer.options.displayName = val;

        this.cancelEdit();
    }

    onLayerNameChange(index, name, val) {
        if (val.length > 0) {
            this.onLayerEdit(val, index);
        }
    }

    onLayerEnabled(obj, e) {
        e.stopPropagation();
        e.preventDefault();

        let props = this.props;

        obj.update({enabled: !obj.options.enabled});

        this.forceUpdate(() => {
            if (props.onLayerChanged) {
                props.onLayerChanged(obj);
            }
        });
    }

    onAddSceneClick() {
        let scene = new Scene(),
            props = this.props;

        Application.stage.addScene(scene);

        this.updateLayers(() => {
            this.setActiveLayer(scene);

            if (props.onLayerAdded) {
                props.onLayerAdded(scene);
            }
        });
    }

    onAddDisplayClick() {
        let scene = this.getActiveScene();

        if (scene) {
            Events.emit(
                'pick_control',
                { title: 'ADD DISPLAY', scene: scene, items: DisplayLibrary }
            );
        }
    }

    onAddEffectClick() {
        let scene = this.getActiveScene();

        if (scene) {
            Events.emit(
                'pick_control',
                { title: 'ADD EFFECT', scene: scene, items: EffectsLibrary }
            );
        }
    }

    onRemoveClick() {
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

            this.updateLayers(() => {
                if (index === last) {
                    this.setState({activeIndex: last - 1});
                }
            });

            if (props.onLayerRemoved) {
                props.onLayerRemoved();
            }
        }
    }

    onMoveUpClick() {
        this.moveLayer(1);
    }

    onMoveDownClick() {
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

        this.setState({ activeIndex: index }, () => {
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
                    onChange={this.onLayerNameChange.bind(this, index)}
                    onCancel={this.cancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.onDoubleClick.bind(this, index)}>
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
                 onClick={this.onLayerClick.bind(this, index)}>
                <i className={classNames('layer-icon', icon)} />
                {text}
                <i className={classNames('layer-options-icon', 'icon-eye', {'layer-disabled': !obj.options.enabled})}
                   onClick={this.onLayerEnabled.bind(this, obj)} />
            </div>
        );
    }

    updateLayers(callback) {
        let layers = [];

        Application.stage.scenes.nodes.reverse().forEach(scene => {
            layers.push(scene);

            scene.effects.nodes.reverse().forEach(effect => {
                layers.push(effect);
            }, this);

            scene.displays.nodes.reverse().forEach(display => {
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

            this.updateLayers(() => {
                index = this.state.layers.indexOf(layer);

                this.setState({activeIndex: index});

                props.onLayerMoved(this.getActiveLayer());
            });
        }
    }

    render() {
        let layers,
            classes = { 'button': true, 'button-disabled': !Application.stage.hasScenes() };

        layers = this.state.layers.map((layer, index) => {
            return this.getLayerComponent(layer, index);
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="button-group">
                    <li className="button icon-picture" title="Add Scene" onClick={this.onAddSceneClick} />
                    <li className={classNames(classes, 'icon-cube')} title="Add Display" onClick={this.onAddDisplayClick} />
                    <li className={classNames(classes, 'icon-light-up')} title="Add Effect" onClick={this.onAddEffectClick} />
                    <li className={classNames(classes, 'icon-chevron-up')} title="Move Layer Up" onClick={this.onMoveUpClick} />
                    <li className={classNames(classes, 'icon-chevron-down')} title="Move Layer Down" onClick={this.onMoveDownClick} />
                    <li className={classNames(classes, 'icon-trash-empty')} title="Delete Layer" onClick={this.onRemoveClick} />
                </ul>
            </div>
        );
    }
}

module.exports = LayersPanel;