import React from 'react';
import propTypes from 'prop-types';

import UIPureComponent from '../UIPureComponent';
import Display from '../../displays/Display';
import CanvasDisplay from '../../displays/CanvasDisplay';
import Scene from '../../displays/Scene';
import Effect from '../../effects/Effect';
import { events } from '../../core/Global';
import Layer from './Layer';
import ButtonInput from '../inputs/ButtonInput';

export default class LayersPanel extends UIPureComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            displays: [],
            activeIndex: 0
        };

        this.app = context.app;
    }

    componentDidMount() {
        events.on('project-loaded', this.onProjectLoaded, this);

        this.updateState();
    }

    componentWillUnmount() {
        events.off('project-loaded', this.onProjectLoaded, this);
    }

    onProjectLoaded() {
        this.updateState(0);
    }

    onLayerClick(index) {
        this.setActiveLayer(index);
    }

    onLayerUpdate(index, name, val) {
        let { displays } = this.state,
            display = displays[index],
            obj = { [name]: val };

        display.update(obj);

        this.setState({ displays: displays.slice(0) });

        this.props.onLayerUpdate(display);
    }

    onAddSceneClick() {
        this.addLayer(new Scene());
    }

    onAddDisplayClick() {
        let scene = this.getActiveScene();

        if (scene) {
            events.emit('pick-control', 'display', display => {
                this.addLayer(display, Display);
            });
        }
    }

    onAddEffectClick() {
        let scene = this.getActiveScene();

        if (scene) {
            events.emit('pick-control', 'effect', display => {
                this.addLayer(display, Effect);
            });
        }
    }

    onRemoveClick() {
        let { displays, activeIndex } = this.state,
            display = displays[activeIndex],
            last = displays.length - 1;

        if (this.app.stage.hasScenes() && display) {
            if (display instanceof Scene) {
                display.owner.removeScene(display);
            }
            else {
                display.owner.removeElement(display);
            }

            if (activeIndex === last) {
                this.updateState(last - 1);
            }
            else {
                this.updateState();
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
        let { displays, activeIndex } = this.state;

        return displays[activeIndex];
    }

    getActiveScene() {
        let layer = this.getActiveLayer();

        return layer ?
            (layer instanceof Scene ? layer : layer.owner) :
            null;
    }

    setActiveLayer(obj) {
        if (typeof obj === 'undefined') return;

        let index = (typeof obj === 'number') ? obj : this.state.displays.indexOf(obj);

        this.setActiveIndex(index);
    }

    setActiveIndex(index) {
        if (index !== this.state.activeIndex) {
            this.setState({ activeIndex: index });
        }

        this.props.onLayerSelected(index);
    }

    addLayer(obj, type) {
        if (obj instanceof Scene) {
            this.addScene(obj);
        }
        else {
            this.addElement(obj, type);
        }
    }

    addScene(newScene) {
        const { displays } = this.state,
            scene = this.getActiveScene();

        let scenes = displays.filter(display => {
            return display instanceof Scene;
        });

        this.app.stage.addScene(newScene, scenes.length - scenes.indexOf(scene));

        this.updateState(newScene);
    }

    addElement(display, type) {
        const { displays } = this.state,
            scene = this.getActiveScene(),
            active = this.getActiveLayer();

        let nodes = displays.filter(display => {
            return display instanceof type;
        });

        if (scene) {
            scene.addElement(display, nodes.length - nodes.indexOf(active));

            this.setActiveLayer(display);

            this.updateState(display);
        }
    }

    moveLayer(direction) {
        let layer,
            scene = this.getActiveScene();

        if (scene) {
            layer = this.getActiveLayer();

            if (layer instanceof Scene) {
                if (layer.owner.shiftScene(layer, direction)) {
                    this.updateState(layer);
                }
            }
            else {
                if (layer.owner.shiftElement(layer, direction)) {
                    this.updateState(layer);
                }
            }
        }
    }

    updateState(index) {
        this.setState(prevState => {
            let displays = this.app.stage.getSortedDisplays(),
                activeIndex = index === undefined ?
                    prevState.activeIndex :
                    typeof index === 'object' ?
                        displays.indexOf(index) :
                        index;

            const state = { displays, activeIndex };

            this.props.onChange(state);

            return state;
        });
    }

    getLayers() {
        return this.state.displays.map((display, index) => {
            let icon;

            if (display instanceof Scene) {
                icon = 'icon-picture';
            }
            else if (display instanceof CanvasDisplay) {
                icon = 'icon-document-landscape';
            }
            else if (display instanceof Effect) {
                icon = 'icon-light-up';
            }
            else if (display instanceof Display) {
                icon = 'icon-cube';
            }

            return (
                <Layer
                    key={display.id}
                    name={display.options.displayName}
                    index={index}
                    icon={icon}
                    control={!(display instanceof Scene)}
                    enabled={display.options.enabled}
                    active={index === this.state.activeIndex}
                    onLayerClick={this.onLayerClick}
                    onLayerUpdate={this.onLayerUpdate}
                />
            );
        });
    }

    render() {
        let layers = this.getLayers(),
            disabled = !this.app.stage.hasScenes();

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
    app: propTypes.object
};