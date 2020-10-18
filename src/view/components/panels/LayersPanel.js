import React, { useMemo } from 'react';
import SceneLayer from 'components/panels/SceneLayer';
import Layout from 'components/layout/Layout';
import ButtonPanel from 'components/layout/ButtonPanel';
import { ButtonInput } from 'components/inputs';
import useApp, { setActiveElementId } from 'actions/app';
import useScenes, {
  addElement,
  addScene,
  moveElement,
  removeElement,
  updateElement,
} from 'actions/scenes';
import { showModal } from 'actions/modals';
import { Picture, Cube, LightUp, ChevronUp, ChevronDown, TrashEmpty } from 'view/icons';
import { reverse } from 'utils/array';
import styles from './LayersPanel.less';

export default function LayersPanel() {
  const scenes = useScenes(state => state.scenes);
  const activeElementId = useApp(state => state.activeElementId);
  const hasScenes = scenes.length > 0;
  const layerSelected = hasScenes && activeElementId;

  const sortedScenes = useMemo(() => reverse(scenes), [scenes]);

  const activeScene = useMemo(() => {
    return scenes.reduce((memo, scene) => {
      if (!memo) {
        if (
          scene?.id === activeElementId ||
          scene?.displays.find(e => e.id === activeElementId) ||
          scene?.effects.find(e => e.id === activeElementId)
        ) {
          memo = scene;
        }
      }
      return memo;
    }, undefined);
  }, [scenes, activeElementId]);

  function handleAddControl(Entity) {
    const entity = new Entity();

    setActiveElementId(entity?.id);

    addElement(entity, activeScene?.id);
  }

  function handleLayerClick(id) {
    setActiveElementId(id);
  }

  function handleLayerUpdate(id, prop, value) {
    updateElement(id, prop, value);
  }

  async function handleAddScene() {
    const scene = await addScene();

    setActiveElementId(scene?.id);
  }

  function handleAddDisplay() {
    showModal(
      'ControlPicker',
      { title: 'Controls' },
      { type: 'displays', onSelect: handleAddControl },
    );
  }

  function handleAddEffect() {
    showModal(
      'ControlPicker',
      { title: 'Controls' },
      { type: 'effects', onSelect: handleAddControl },
    );
  }

  function handleMoveUp() {
    moveElement(activeElementId, 1);
  }
  function handleMoveDown() {
    moveElement(activeElementId, -1);
  }

  function handleRemove() {
    if (activeElementId) {
      if (activeElementId === activeScene?.id) {
        const newScene = sortedScenes.find(e => e !== activeScene);

        setActiveElementId(newScene?.id);
      } else {
        const scene = sortedScenes.find(e => e === activeScene);

        if (scene) {
          const { displays, effects } = scene;
          const element =
            reverse(displays).find(e => e !== activeElementId) ||
            reverse(effects).find(e => e !== activeElementId);

          if (element) {
            setActiveElementId(element?.id);
          } else {
            setActiveElementId(activeScene?.id);
          }
        }
      }

      removeElement(activeElementId);
    }
  }

  return (
    <Layout className={styles.panel}>
      <div className={styles.layers}>
        {sortedScenes.map(scene => (
          <SceneLayer
            key={scene.id}
            scene={scene}
            activeElementId={activeElementId}
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
