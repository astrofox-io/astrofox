import React, { useMemo } from 'react';
import SceneLayer from 'components/panels/SceneLayer';
import Layout from 'components/layout/Layout';
import ButtonPanel from 'components/layout/ButtonPanel';
import { ButtonInput } from 'components/inputs';
import useScenes, {
  addElement,
  addScene,
  moveElement,
  removeElement,
  updateElement,
  setActiveElement,
} from 'actions/scenes';
import { showModal } from 'actions/modals';
import { Picture, Cube, LightUp, ChevronUp, ChevronDown, TrashEmpty } from 'view/icons';
import { reverse } from 'utils/array';
import styles from './LayersPanel.less';

export default function LayersPanel() {
  const scenes = useScenes(state => state.scenes);
  const activeElement = useScenes(state => state.activeElement);
  const hasScenes = scenes.length > 0;
  const layerSelected = hasScenes && activeElement;

  const sortedScenes = useMemo(() => reverse(scenes), [scenes]);

  const activeScene = useMemo(() => {
    return scenes.reduce((memo, scene) => {
      if (!memo) {
        if (scene === activeElement) {
          memo = activeElement;
        } else if (
          scene.displays.find(e => e === activeElement) ||
          scene.effects.find(e => e === activeElement)
        ) {
          memo = scene;
        }
      }
      return memo;
    }, undefined);
  }, [scenes, activeElement]);

  function handleAddControl(Entity) {
    const entity = new Entity();

    setActiveElement(entity);

    addElement(entity, activeScene);
  }

  function handleLayerClick(element) {
    setActiveElement(element);
  }

  function handleLayerUpdate(id, prop, value) {
    updateElement(id, prop, value);
  }

  async function handleAddScene() {
    const scene = await addScene();

    setActiveElement(scene);
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
    moveElement(activeElement, 1);
  }
  function handleMoveDown() {
    moveElement(activeElement, -1);
  }

  function handleRemove() {
    if (activeElement) {
      if (activeElement === activeScene) {
        const newScene = sortedScenes.find(e => e !== activeScene);

        setActiveElement(newScene);
      } else {
        const scene = sortedScenes.find(e => e === activeScene);

        if (scene) {
          const { displays, effects } = scene;
          const element =
            reverse(displays).find(e => e !== activeElement) ||
            reverse(effects).find(e => e !== activeElement);

          if (element) {
            setActiveElement(element);
          } else {
            setActiveElement(activeScene);
          }
        }
      }

      removeElement(activeElement);
    }
  }

  return (
    <Layout className={styles.panel}>
      <div className={styles.layers}>
        {sortedScenes.map(scene => (
          <SceneLayer
            key={scene.id}
            scene={scene}
            activeLayer={activeElement}
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
