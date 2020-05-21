import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import SceneLayer from 'components/panels/SceneLayer';
import Layout from 'components/layout/Layout';
import ButtonPanel from 'components/layout/ButtonPanel';
import { ButtonInput } from 'components/inputs';
import { addElement, addScene, moveElement, removeElement, updateElement } from 'actions/scenes';
import { setActiveEntityId } from 'actions/app';
import { showModal } from 'actions/modals';
import { Picture, Cube, LightUp, ChevronUp, ChevronDown, TrashEmpty } from 'view/icons';
import { reverse } from 'utils/array';
import styles from './LayersPanel.less';

export default function LayersPanel() {
  const dispatch = useDispatch();
  const scenes = useSelector(state => state.scenes);
  const [activeId, setActiveId] = useState();
  const hasScenes = scenes.length > 0;
  const layerSelected = hasScenes && activeId;

  const sortedScenes = useMemo(() => reverse(scenes), [scenes]);

  const activeSceneId = useMemo(() => {
    return scenes.reduce((memo, scene) => {
      if (!memo) {
        if (scene.id === activeId) {
          memo = activeId;
        } else if (
          scene.displays.find(e => e.id === activeId || scene.effects.find(e => e.id === activeId))
        ) {
          memo = scene.id;
        }
      }
      return memo;
    }, undefined);
  }, [scenes, activeId]);

  function handleAddControl(Entity) {
    const entity = new Entity();
    const { id } = entity;

    setActiveId(id);

    dispatch(addElement(entity, activeSceneId));
    dispatch(setActiveEntityId(id));
  }

  function handleLayerClick(id) {
    setActiveId(id);
    dispatch(setActiveEntityId(id));
  }

  function handleLayerUpdate(id, prop, value) {
    dispatch(updateElement(id, prop, value));
  }

  async function handleAddScene() {
    const scene = await dispatch(addScene());
    setActiveId(scene.id);
  }

  function handleAddDisplay() {
    dispatch(
      showModal(
        'ControlPicker',
        { title: 'Controls' },
        { type: 'displays', onSelect: handleAddControl },
      ),
    );
  }

  function handleAddEffect() {
    dispatch(
      showModal(
        'ControlPicker',
        { title: 'Controls' },
        { type: 'effects', onSelect: handleAddControl },
      ),
    );
  }

  function handleMoveUp() {
    dispatch(moveElement(activeId, 1));
  }
  function handleMoveDown() {
    dispatch(moveElement(activeId, -1));
  }

  function handleRemove() {
    if (activeId) {
      if (activeId === activeSceneId) {
        const newScene = sortedScenes.find(e => e.id !== activeSceneId);

        setActiveId(newScene?.id);
      } else {
        const scene = sortedScenes.find(e => e.id === activeSceneId);
        if (scene) {
          const { displays, effects } = scene;
          const element =
            reverse(displays).find(e => e.id !== activeId) ||
            reverse(effects).find(e => e.id !== activeId);

          if (element) {
            setActiveId(element.id);
          } else {
            setActiveId(activeSceneId);
          }
        }
      }

      dispatch(removeElement(activeId));
    }
  }

  return (
    <Layout className={styles.panel}>
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
      <ButtonPanel>
        <ButtonInput icon={Picture} title="Add Scene" onClick={handleAddScene} />
        <ButtonInput
          icon={Cube}
          title="Add Display"
          onClick={handleAddDisplay}
          disabled={!hasScenes}
        />
        <ButtonInput
          icon={LightUp}
          title="Add Effect"
          onClick={handleAddEffect}
          disabled={!hasScenes}
        />
        <ButtonInput
          icon={ChevronUp}
          title="Move Layer Up"
          onClick={handleMoveUp}
          disabled={!layerSelected}
        />
        <ButtonInput
          icon={ChevronDown}
          title="Move Layer Down"
          onClick={handleMoveDown}
          disabled={!layerSelected}
        />
        <ButtonInput
          icon={TrashEmpty}
          title="Delete Layer"
          onClick={handleRemove}
          disabled={!layerSelected}
        />
      </ButtonPanel>
    </Layout>
  );
}
