import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { stage } from 'view/global';
import SceneLayer from 'components/panels/SceneLayer';
import { ButtonInput, ButtonGroup } from 'components/inputs';
import { updateSceneElement } from 'actions/scenes';
import iconScene from 'assets/icons/picture.svg';
import iconDisplay from 'assets/icons/cube.svg';
import iconEffect from 'assets/icons/light-up.svg';
import iconMoveUp from 'assets/icons/chevron-up.svg';
import iconMoveDown from 'assets/icons/chevron-down.svg';
import iconDelete from 'assets/icons/trash-empty.svg';
import styles from './LayersPanel.less';
import panelStyles from '../layout/Panel.less';

export default function LayersPanel() {
  const dispatch = useDispatch();
  const scenes = useSelector(state => state.scenes);
  const [activeLayer, setActiveLayer] = useState();
  const disabled = !stage.hasScenes();

  function handleLayerClick(id) {
    setActiveLayer(id);
  }

  function handleLayerUpdate(id, prop, value) {
    dispatch(updateSceneElement(id, prop, value));
  }

  function handleAddScene() {}
  function handleAddDisplay() {}
  function handleAddEffect() {}
  function handleMoveUp() {}
  function handleMoveDown() {}
  function handleRemove() {}

  return (
    <div className={styles.panel}>
      <div className={styles.layers}>
        {scenes.map(scene => (
          <SceneLayer
            key={scene.id}
            scene={scene}
            activeLayer={activeLayer}
            onLayerClick={handleLayerClick}
            onLayerUpdate={handleLayerUpdate}
          />
        ))}
      </div>
      <div className={panelStyles.buttons}>
        <ButtonInput icon={iconScene} title="Add Scene" onClick={handleAddScene} />
        <ButtonInput
          icon={iconDisplay}
          title="Add Display"
          onClick={handleAddDisplay}
          disabled={disabled}
        />
        <ButtonInput
          icon={iconEffect}
          title="Add Effect"
          onClick={handleAddEffect}
          disabled={disabled}
        />
        <ButtonGroup>
          <ButtonInput
            icon={iconMoveUp}
            title="Move Layer Up"
            onClick={handleMoveUp}
            disabled={disabled}
          />
          <ButtonInput
            icon={iconMoveDown}
            title="Move Layer Down"
            onClick={handleMoveDown}
            disabled={disabled}
          />
        </ButtonGroup>
        <ButtonInput
          icon={iconDelete}
          title="Delete Layer"
          onClick={handleRemove}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
