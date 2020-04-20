import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SceneLayer from 'components/panels/SceneLayer';
import { ButtonInput, ButtonGroup } from 'components/inputs';
import { addScene, moveElement, removeElement, updateElement } from 'actions/scenes';
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
  const [activeId, setActiveId] = useState();
  const hasScenes = !!scenes.length;

  const sortedScenes = useMemo(() => [...scenes].reverse(), [scenes]);

  function handleLayerClick(id) {
    setActiveId(id);
  }

  function handleLayerUpdate(id, prop, value) {
    dispatch(updateElement(id, prop, value));
  }

  function handleAddScene() {
    dispatch(addScene());
  }

  function handleAddDisplay() {}
  function handleAddEffect() {}

  function handleMoveUp() {
    dispatch(moveElement(activeId, 1));
  }
  function handleMoveDown() {
    dispatch(moveElement(activeId, -1));
  }

  function handleRemove() {
    if (activeId) {
      dispatch(removeElement(activeId));
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.layers}>
        {sortedScenes.map(scene => (
          <SceneLayer
            key={scene.id}
            scene={scene}
            activeLayer={activeId}
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
          disabled={!hasScenes}
        />
        <ButtonInput
          icon={iconEffect}
          title="Add Effect"
          onClick={handleAddEffect}
          disabled={!hasScenes}
        />
        <ButtonGroup>
          <ButtonInput
            icon={iconMoveUp}
            title="Move Layer Up"
            onClick={handleMoveUp}
            disabled={!hasScenes}
          />
          <ButtonInput
            icon={iconMoveDown}
            title="Move Layer Down"
            onClick={handleMoveDown}
            disabled={!hasScenes}
          />
        </ButtonGroup>
        <ButtonInput
          icon={iconDelete}
          title="Delete Layer"
          onClick={handleRemove}
          disabled={!hasScenes || !activeId}
        />
      </div>
    </div>
  );
}
