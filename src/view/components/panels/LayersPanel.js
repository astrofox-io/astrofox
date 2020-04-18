import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Display from 'core/Display';
import CanvasDisplay from 'core/CanvasDisplay';
import Scene from 'core/Scene';
import Effect from 'core/Effect';
import { events, stage } from 'view/global';
import { ButtonInput, ButtonGroup } from 'components/inputs';
import Layer from 'components/panels/Layer';
import iconScene from 'assets/icons/picture.svg';
import iconDisplay from 'assets/icons/cube.svg';
import iconEffect from 'assets/icons/light-up.svg';
import iconMoveUp from 'assets/icons/chevron-up.svg';
import iconMoveDown from 'assets/icons/chevron-down.svg';
import iconDelete from 'assets/icons/trash-empty.svg';
import iconCanvasDisplay from 'assets/icons/document-landscape.svg';
import styles from './LayersPanel.less';
import panelStyles from '../layout/Panel.less';

export default function LayersPanel({ onLayerUpdate }) {
  const dispatch = useDispatch();
  const displays = useSelector(state => state.displays);
  const [activeIndex, setActiveIndex] = useState();

  const handleLayerClick = index => {
    this.setActiveLayer(index);
  };

  const handleLayerUpdate = (index, name, val) => {
    const display = displays[index];
    const obj = { [name]: val };

    display.update(obj);

    this.setState({ displays: displays.slice(0) });

    onLayerUpdate(display);
  };

  const handleAddSceneClick = () => {
    addLayer(new Scene());
  };

  const handleAddDisplayClick = () => {
    const scene = getActiveScene();

    if (scene) {
      events.emit('pick-control', 'display', display => {
        addLayer(display, Display);
      });
    }
  };

  const handleAddEffectClick = () => {
    const scene = getActiveScene();

    if (scene) {
      events.emit('pick-control', 'effect', display => {
        addLayer(display, Effect);
      });
    }
  };

  const handleRemoveClick = () => {
    const display = displays[activeIndex];
    const last = displays.length - 1;

    if (stage.hasScenes() && display) {
      if (display instanceof Scene) {
        display.stage.removeScene(display);
      } else {
        display.scene.removeElement(display);
      }

      if (activeIndex === last) {
        this.updateState(last - 1);
      } else {
        this.updateState();
      }
    }
  };

  const handleMoveUpClick = () => {
    moveLayer(1);
  };

  const handleMoveDownClick = () => {
    moveLayer(-1);
  };

  function getLayers() {
    return displays.map((display, index) => {
      let icon;

      if (display instanceof Scene) {
        icon = iconScene;
      } else if (display instanceof CanvasDisplay) {
        icon = iconCanvasDisplay;
      } else if (display instanceof Effect) {
        icon = iconEffect;
      } else if (display instanceof Display) {
        icon = iconDisplay;
      }

      return (
        <Layer
          key={display.id}
          name={display.properties.displayName}
          index={index}
          icon={icon}
          control={!(display instanceof Scene)}
          enabled={display.properties.enabled}
          active={index === activeIndex}
          onLayerClick={this.handleLayerClick}
          onLayerUpdate={this.handleLayerUpdate}
        />
      );
    });
  }

  function getActiveLayer() {
    return displays[activeIndex];
  }

  function getActiveScene() {
    const layer = this.getActiveLayer();

    if (layer instanceof Scene) {
      return layer;
    }

    return layer ? layer.scene : null;
  }

  function setActiveLayer(obj) {
    if (obj === undefined) return;

    const index = typeof obj === 'number' ? obj : this.state.displays.indexOf(obj);

    this.setActiveIndex(index);
  }

  function addLayer(obj, type) {
    if (obj instanceof Scene) {
      this.addScene(obj);
    } else {
      this.addElement(obj, type);
    }
  }

  function addScene(newScene) {
    const scene = getActiveScene();

    const scenes = displays.filter(display => display instanceof Scene);

    stage.addScene(newScene, scenes.length - scenes.indexOf(scene));

    this.updateState(newScene);
  }

  function addElement(display, type) {
    const { displays } = this.state;
    const scene = this.getActiveScene();
    const active = this.getActiveLayer();

    const nodes = displays.filter(d => d instanceof type);

    if (scene) {
      scene.addElement(display, nodes.length - nodes.indexOf(active));

      this.setActiveLayer(display);

      this.updateState(display);
    }
  }

  function moveLayer(direction) {
    if (this.getActiveScene()) {
      const layer = this.getActiveLayer();

      if (layer instanceof Scene) {
        if (layer.stage.shiftScene(layer, direction)) {
          this.updateState(layer);
        }
      } else if (layer.scene.shiftElement(layer, direction)) {
        this.updateState(layer);
      }
    }
  }

  function updateState(obj) {
    this.setState(({ activeIndex }) => {
      const {
        app: { stage },
        onChange,
      } = this.props;
      const displays = stage.getSortedDisplays();

      let index = obj === undefined ? activeIndex : 0;

      if (!index && typeof obj === 'object') {
        index = displays.indexOf(obj);
      }

      const state = { displays, activeIndex: index };

      onChange(state);

      return state;
    });
  }

  const layers = getLayers();
  const disabled = !stage.hasScenes();

  return (
    <div className={styles.panel}>
      <div className={styles.layers}>{layers}</div>
      <div className={panelStyles.buttons}>
        <ButtonInput icon={iconScene} title="Add Scene" onClick={handleAddSceneClick} />
        <ButtonInput
          icon={iconDisplay}
          title="Add Display"
          onClick={handleAddDisplayClick}
          disabled={disabled}
        />
        <ButtonInput
          icon={iconEffect}
          title="Add Effect"
          onClick={handleAddEffectClick}
          disabled={disabled}
        />
        <ButtonGroup>
          <ButtonInput
            icon={iconMoveUp}
            title="Move Layer Up"
            onClick={handleMoveUpClick}
            disabled={disabled}
          />
          <ButtonInput
            icon={iconMoveDown}
            title="Move Layer Down"
            onClick={handleMoveDownClick}
            disabled={disabled}
          />
        </ButtonGroup>
        <ButtonInput
          icon={iconDelete}
          title="Delete Layer"
          onClick={handleRemoveClick}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
