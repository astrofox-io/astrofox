import React from 'react';
import propTypes from 'prop-types';

import UIPureComponent from 'components/UIPureComponent';
import Display from 'core/Display';
import CanvasDisplay from 'core/CanvasDisplay';
import Scene from 'core/Scene';
import Effect from 'core/Effect';
import { events } from 'core/Global';
import Layer from 'components/panels/Layer';
import ButtonInput from 'components/inputs/ButtonInput';
import ButtonGroup from 'components/inputs/ButtonGroup';
import Icon from 'components/interface/Icon';

import iconScene from 'svg/icons/picture.svg';
import iconDisplay from 'svg/icons/cube.svg';
import iconEffect from 'svg/icons/light-up.svg';
import iconMoveUp from 'svg/icons/chevron-up.svg';
import iconMoveDown from 'svg/icons/chevron-down.svg';
import iconDelete from 'svg/icons/trash-empty.svg';
import iconCanvasDisplay from 'svg/icons/document-landscape.svg';

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
                icon = iconScene;
            }
            else if (display instanceof CanvasDisplay) {
                icon = iconCanvasDisplay;
            }
            else if (display instanceof Effect) {
                icon = iconEffect;
            }
            else if (display instanceof Display) {
                icon = iconDisplay;
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
                <div className="panel-buttons">
                    <ButtonInput icon={iconScene} title="Add Scene" onClick={this.onAddSceneClick} />
                    <ButtonInput icon={iconDisplay} title="Add Display" onClick={this.onAddDisplayClick} disabled={disabled} />
                    <ButtonInput icon={iconEffect} title="Add Effect" onClick={this.onAddEffectClick} disabled={disabled} />
                    <ButtonGroup>
                        <ButtonInput icon={iconMoveUp} title="Move Layer Up" onClick={this.onMoveUpClick} disabled={disabled} />
                        <ButtonInput icon={iconMoveDown} title="Move Layer Down" onClick={this.onMoveDownClick} disabled={disabled} />
                    </ButtonGroup>
                    <ButtonInput icon={iconDelete} title="Delete Layer" onClick={this.onRemoveClick} disabled={disabled} />
                </div>
            </div>
        );
    }
}

LayersPanel.contextTypes = {
    app: propTypes.object
};