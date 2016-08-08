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

const Layer = require('./Layer.jsx');

class LayersPanel extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            activeIndex: 0,
            layers: []
        };
    }

    componentWillMount() {
        this.updateLayers();
    }

    onLayerClick(index) {
        this.setState({activeIndex: index}, () => {
            this.props.onLayerSelected(this.state.layers[index]);
        });
    }

    onLayerUpdate(index, name, val) {
        let layer = this.state.layers[index],
            obj = {};

        obj[name] = val;
        layer.update(obj);

        this.forceUpdate(() => {
            this.props.onLayerChanged(obj);
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

                this.setState({ activeIndex: index });

                props.onLayerMoved(this.getActiveLayer());
            });
        }
    }

    render() {
        let layers,
            state = this.state,
            classes = { 'input-button': true, 'input-button-disabled': !Application.stage.hasScenes() };

        layers = state.layers.map((layer, index) => {
            let icon;

            if (layer instanceof Scene) {
                icon = 'icon-picture';
            }
            else if (layer instanceof CanvasDisplay) {
                icon = 'icon-document-landscape';
            }
            else if (layer instanceof Effect) {
                icon = 'icon-light-up';
            }
            else if (layer instanceof Display) {
                icon = 'icon-cube';
            }

            return (
                <Layer
                    key={layer.id}
                    name={layer.options.displayName}
                    index={index}
                    icon={icon}
                    control={!(layer instanceof Scene)}
                    enabled={layer.options.enabled}
                    active={index === state.activeIndex}
                    onLayerClick={this.onLayerClick}
                    onLayerUpdate={this.onLayerUpdate}
                />
            );
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="action-panel">
                    <li className="input-button icon-picture" title="Add Scene" onClick={this.onAddSceneClick} />
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

LayersPanel.defaultProps = {
    onLayerSelected: () => {}
};

module.exports = LayersPanel;