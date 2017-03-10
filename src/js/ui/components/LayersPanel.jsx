import React from 'react';

import UIComponent from '../UIComponent';
import Display from '../../displays/Display';
import CanvasDisplay from '../../displays/CanvasDisplay';
import Scene from '../../displays/Scene';
import Effect from '../../effects/Effect';
import { events } from '../../core/Global';
import Layer from './Layer';
import ButtonInput from '../inputs/ButtonInput';

export default class LayersPanel extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            activeIndex: 0,
            layers: []
        };

        this.app = context.app;
    }

    componentWillMount() {
        this.updateLayers();
    }

    onLayerClick(index) {
        this.setActiveIndex(index);
    }

    onLayerUpdate(index, name, val) {
        let layers = this.state.layers,
            layer = layers[index],
            obj = {};

        obj[name] = val;
        layer.update(obj);

        this.setState({ layers: layers });

        this.props.onLayerChanged(obj);
    }

    onAddSceneClick() {
        let scene = new Scene();

        this.app.stage.addScene(scene);

        this.updateLayers(() => {
            this.setActiveLayer(scene);

            this.props.onLayerAdded(scene);
        });
    }

    onAddDisplayClick() {
        let scene = this.getActiveScene();

        if (scene) {
            events.emit('pick-control', 'display');
        }
    }

    onAddEffectClick() {
        let scene = this.getActiveScene();

        if (scene) {
            events.emit('pick-control', 'effect');
        }
    }

    onRemoveClick() {
        let state = this.state,
            index = this.state.activeIndex,
            layers = state.layers,
            layer = layers[index],
            last = layers.length - 1;

        if (this.app.stage.hasScenes() && layer) {
            if (layer instanceof Scene) {
                layer.owner.removeScene(layer);
            }
            else {
                layer.owner.removeElement(layer);
            }

            this.updateLayers(() => {
                if (index === last) {
                    this.setActiveIndex(last - 1);
                }
            });

            this.props.onLayerRemoved();
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

        return (layer && this.state.activeIndex >= 0) ?
            (layer instanceof Scene ? layer : layer.owner) :
            null;
    }

    setActiveLayer(obj) {
        if (typeof obj === 'undefined') return;

        let index = (typeof obj === 'number') ? obj : this.state.layers.indexOf(obj);

        this.setActiveIndex(index);
    }

    setActiveIndex(index) {
        this.setState({ activeIndex: index }, () => {
            this.props.onLayerSelected(this.getActiveLayer(), index);
        });
    }

    updateLayers(callback) {
        let layers = [];

        this.app.stage.getScenes().reverse().forEach(scene => {
            layers.push(scene);

            scene.getEffects().reverse().forEach(effect => {
                layers.push(effect);
            });

            scene.getDisplays().reverse().forEach(display => {
                layers.push(display);
            });
        });

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

                this.setActiveIndex(index);

                props.onLayerMoved(this.getActiveLayer());
            });
        }
    }

    render() {
        let layers,
            state = this.state,
            disabled = !this.app.stage.hasScenes();

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
        });

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <div className="button-panel">
                    <ButtonInput icon="icon-picture" title="Add Scene" onClick={this.onAddSceneClick} />
                    <ButtonInput icon="icon-cube" title="Add Display" onClick={this.onAddDisplayClick} disabled={disabled} />
                    <ButtonInput icon="icon-light-up" title="Add Effect" onClick={this.onAddEffectClick} disabled={disabled} />
                    <ButtonInput icon="icon-chevron-up" title="Move Layer Up" onClick={this.onMoveUpClick} disabled={disabled} />
                    <ButtonInput icon="icon-chevron-down" title="Move Layer Down" onClick={this.onMoveDownClick} disabled={disabled} />
                    <ButtonInput icon="icon-trash-empty" title="Delete Layer" onClick={this.onRemoveClick} disabled={disabled} />
                </div>
            </div>
        );
    }
}

LayersPanel.contextTypes = {
    app: React.PropTypes.object
};