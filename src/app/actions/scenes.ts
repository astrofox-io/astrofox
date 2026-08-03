// @ts-nocheck

import { create } from 'zustand';
import { renderer, stage } from '@/app/global';
import { getDisplayRenderGroup } from '@/lib/utils/displayRenderGroup';
import { touchProject } from './project';

const initialState = {
  scenes: [],
  sceneOrder: [],
  sceneById: {},
  elementById: {},
  sceneElementsById: {},
  elementParentSceneId: {},
};

const sceneStore = create(() => ({
  ...initialState,
}));

function normalizeScenes(scenes) {
  const sceneOrder = [];
  const sceneById = {};
  const elementById = {};
  const sceneElementsById = {};
  const elementParentSceneId = {};

  for (const scene of scenes) {
    sceneOrder.push(scene.id);
    sceneById[scene.id] = scene;

    const displayIds = [];
    for (const display of scene.displays || []) {
      displayIds.push(display.id);
      elementById[display.id] = display;
      elementParentSceneId[display.id] = scene.id;
    }

    const effectIds = [];
    for (const effect of scene.effects || []) {
      effectIds.push(effect.id);
      elementById[effect.id] = effect;
      elementParentSceneId[effect.id] = scene.id;
    }

    sceneElementsById[scene.id] = {
      displays: displayIds,
      effects: effectIds,
    };
  }

  return {
    scenes,
    sceneOrder,
    sceneById,
    elementById,
    sceneElementsById,
    elementParentSceneId,
  };
}

function setScenesState(scenes, touch = true) {
  sceneStore.setState(normalizeScenes(scenes));
  renderer.requestRender();

  if (touch) {
    touchProject();
  }
}

function getElementTarget(type) {
  return type === 'effect' ? 'effects' : 'displays';
}

function getDisplayGroups(displays) {
  return {
    '3d': displays.filter(display => getDisplayRenderGroup(display) === '3d'),
    '2d': displays.filter(display => getDisplayRenderGroup(display) === '2d'),
  };
}

function buildDisplayOrder(displayGroups) {
  return [...displayGroups['3d'], ...displayGroups['2d']];
}

function getDisplayGroupLength(displays, renderGroup) {
  return displays.filter(display => getDisplayRenderGroup(display) === renderGroup).length;
}

function getDisplayGroupIndex(displays, displayIndex) {
  const renderGroup = getDisplayRenderGroup(displays[displayIndex]);
  let groupIndex = -1;

  for (let i = 0; i <= displayIndex; i += 1) {
    if (getDisplayRenderGroup(displays[i]) === renderGroup) {
      groupIndex += 1;
    }
  }

  return {
    renderGroup,
    groupIndex,
  };
}

function insertDisplayAtRenderGroup(displays, display, targetIndex) {
  const renderGroup = getDisplayRenderGroup(display);
  const displayGroups = getDisplayGroups(displays);
  displayGroups[renderGroup] = insertAtIndex(displayGroups[renderGroup], targetIndex, display);
  return buildDisplayOrder(displayGroups);
}

function moveDisplayWithinRenderGroup(displays, sourceIndex, targetGroupIndex) {
  const { renderGroup, groupIndex } = getDisplayGroupIndex(displays, sourceIndex);
  const displayGroups = getDisplayGroups(displays);
  const nextGroup = moveAtIndex(displayGroups[renderGroup], groupIndex, targetGroupIndex);

  if (nextGroup === displayGroups[renderGroup]) {
    return displays;
  }

  displayGroups[renderGroup] = nextGroup;
  return buildDisplayOrder(displayGroups);
}

function insertAtIndex(items, index, item) {
  const nextItems = [...items];
  const normalizedIndex = Math.max(0, Math.min(index, nextItems.length));
  nextItems.splice(normalizedIndex, 0, item);
  return nextItems;
}

function findElementLocation(scenes, id) {
  const sceneIndex = scenes.findIndex(scene => scene.id === id);

  if (sceneIndex > -1) {
    return {
      type: 'scene',
      sceneId: id,
      index: sceneIndex,
    };
  }

  for (const scene of scenes) {
    const displayIndex = scene.displays.findIndex(display => display.id === id);
    if (displayIndex > -1) {
      const { renderGroup, groupIndex } = getDisplayGroupIndex(scene.displays, displayIndex);
      return {
        type: 'display',
        sceneId: scene.id,
        index: displayIndex,
        renderGroup,
        groupIndex,
      };
    }

    const effectIndex = scene.effects.findIndex(effect => effect.id === id);
    if (effectIndex > -1) {
      return {
        type: 'effect',
        sceneId: scene.id,
        index: effectIndex,
      };
    }
  }

  return null;
}

function updateScenes(callback) {
  const scenes = sceneStore.getState().scenes;
  const nextScenes = callback(scenes);

  if (nextScenes) {
    setScenesState(nextScenes);
  }

  return nextScenes;
}

export function getSceneIdForElement(
  elementId,
  sceneById = sceneStore.getState().sceneById,
  elementParentSceneId = sceneStore.getState().elementParentSceneId,
) {
  if (!elementId) {
    return null;
  }

  if (sceneById[elementId]) {
    return elementId;
  }

  return elementParentSceneId[elementId] || null;
}

export function loadScenes(touch = true) {
  setScenesState(stage.scenes.toJSON(), touch);
}

export function resetScenes(touch = true) {
  sceneStore.setState({ ...initialState });

  stage.clearScenes();
  renderer.requestRender();

  if (touch) {
    touchProject();
  }
}

export function addScene() {
  const scene = stage.addScene();

  updateScenes(scenes => [...scenes, scene.toJSON()]);

  return scene;
}

export function addElement(element, sceneId) {
  const { scenes } = sceneStore.getState();
  const targetSceneId = sceneId || scenes[0]?.id;
  const target = getElementTarget(element.type);

  if (!targetSceneId) {
    return;
  }

  const nextElement = element.toJSON();
  const targetScene = scenes.find(scene => scene.id === targetSceneId);
  const targetIndex =
    target === 'displays'
      ? getDisplayGroupLength(targetScene?.displays || [], getDisplayRenderGroup(nextElement))
      : undefined;

  updateScenes(currentScenes =>
    currentScenes.map(scene => {
      if (scene.id !== targetSceneId) {
        return scene;
      }

      return {
        ...scene,
        [target]:
          target === 'displays'
            ? insertDisplayAtRenderGroup(scene[target], nextElement, targetIndex)
            : [...scene[target], nextElement],
      };
    }),
  );

  const scene = stage.getSceneById(targetSceneId) || stage.scenes[0];

  if (scene) {
    scene.addElement(element, targetIndex);
  }
}

export function updateElement(id, prop, value) {
  updateScenes(scenes =>
    scenes.map(scene => {
      if (scene.id === id) {
        return { ...scene, [prop]: value };
      }

      const displays = scene.displays.map(display =>
        display.id === id ? { ...display, [prop]: value } : display,
      );
      const effects = scene.effects.map(effect =>
        effect.id === id ? { ...effect, [prop]: value } : effect,
      );

      if (displays !== scene.displays || effects !== scene.effects) {
        return { ...scene, displays, effects };
      }

      return scene;
    }),
  );

  const element = stage.getStageElementById(id);

  if (element) {
    element[prop] = value;
  }
}

export function updateElementProperty(id, prop, value) {
  updateElementProperties(id, { [prop]: value });
}

export function updateElementProperties(id, properties) {
  updateScenes(scenes =>
    scenes.map(scene => {
      if (scene.id === id) {
        return {
          ...scene,
          properties: { ...scene.properties, ...properties },
        };
      }

      const displays = scene.displays.map(display =>
        display.id === id
          ? {
              ...display,
              properties: { ...display.properties, ...properties },
            }
          : display,
      );
      const effects = scene.effects.map(effect =>
        effect.id === id
          ? {
              ...effect,
              properties: { ...effect.properties, ...properties },
            }
          : effect,
      );

      if (displays !== scene.displays || effects !== scene.effects) {
        return { ...scene, displays, effects };
      }

      return scene;
    }),
  );

  const element = stage.getStageElementById(id);

  if (element) {
    element.update(properties);
  }
}

export function removeElement(id) {
  updateScenes(scenes => {
    const sceneIndex = scenes.findIndex(scene => scene.id === id);

    if (sceneIndex > -1) {
      return scenes.filter(scene => scene.id !== id);
    }

    let hasChanges = false;
    const nextScenes = scenes.map(scene => {
      const displays = scene.displays.filter(display => display.id !== id);
      const effects = scene.effects.filter(effect => effect.id !== id);

      if (displays.length !== scene.displays.length || effects.length !== scene.effects.length) {
        hasChanges = true;
        return { ...scene, displays, effects };
      }

      return scene;
    });

    return hasChanges ? nextScenes : scenes;
  });

  const element = stage.getStageElementById(id);

  if (element) {
    stage.removeStageElement(element);
  }
}

function swapAtIndex(items, index, spaces) {
  const newIndex = index + spaces;

  if (
    index === newIndex ||
    index < 0 ||
    index >= items.length ||
    newIndex < 0 ||
    newIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const tmp = nextItems[index];
  nextItems[index] = nextItems[newIndex];
  nextItems[newIndex] = tmp;

  return nextItems;
}

function moveAtIndex(items, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);

  return nextItems;
}

export function moveElement(id, spaces) {
  const scenes = sceneStore.getState().scenes;
  const source = findElementLocation(scenes, id);

  if (!source) {
    return;
  }

  if (source.type === 'scene') {
    updateScenes(currentScenes => swapAtIndex(currentScenes, source.index, spaces));

    const element = stage.getStageElementById(id);
    if (element) {
      stage.shiftStageElement(element, spaces);
    }
    return;
  }

  if (source.type === 'effect') {
    updateScenes(currentScenes =>
      currentScenes.map(scene => {
        if (scene.id !== source.sceneId) {
          return scene;
        }

        return {
          ...scene,
          effects: swapAtIndex(scene.effects, source.index, spaces),
        };
      }),
    );

    const element = stage.getStageElementById(id);
    if (element) {
      stage.shiftStageElement(element, spaces);
    }
    return;
  }

  const sourceScene = scenes.find(scene => scene.id === source.sceneId);
  if (!sourceScene) {
    return;
  }

  const targetGroupIndex = source.groupIndex + spaces;
  const nextDisplays = moveDisplayWithinRenderGroup(
    sourceScene.displays,
    source.index,
    targetGroupIndex,
  );

  if (nextDisplays === sourceScene.displays) {
    return;
  }

  updateScenes(currentScenes =>
    currentScenes.map(scene =>
      scene.id === source.sceneId ? { ...scene, displays: nextDisplays } : scene,
    ),
  );

  const element = stage.getStageElementById(id);
  const sceneInstance = stage.getSceneById(source.sceneId);
  const targetIndex = nextDisplays.findIndex(display => display.id === id);

  if (element && sceneInstance && targetIndex > -1) {
    sceneInstance.removeElement(element);
    sceneInstance.addElement(element, targetIndex);
  }
}

export function reorderElement(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return false;
  }

  const scenes = sceneStore.getState().scenes;
  const source = findElementLocation(scenes, sourceId);
  const target = findElementLocation(scenes, targetId);

  if (!source || !target) {
    return false;
  }

  if (source.type === 'scene' || target.type === 'scene') {
    if (source.type !== 'scene' && target.type !== 'scene') {
      const sourceCollection = getElementTarget(source.type);
      const sourceScene = scenes.find(scene => scene.id === source.sceneId);
      const targetScene = scenes.find(scene => scene.id === target.sceneId);
      const sourceItem = sourceScene?.[sourceCollection]?.[source.index];

      if (!sourceScene || !targetScene || !sourceItem) {
        return false;
      }

      const sourceDisplays =
        source.type === 'display'
          ? sourceScene.displays.filter(item => item.id !== sourceId)
          : sourceScene.displays;
      const sourceEffects =
        source.type === 'effect'
          ? sourceScene.effects.filter(item => item.id !== sourceId)
          : sourceScene.effects;
      const targetDisplays =
        source.type === 'display'
          ? insertDisplayAtRenderGroup(
              source.sceneId === target.sceneId ? sourceDisplays : targetScene.displays,
              sourceItem,
              getDisplayGroupLength(
                source.sceneId === target.sceneId ? sourceDisplays : targetScene.displays,
                source.renderGroup,
              ),
            )
          : source.sceneId === target.sceneId
            ? sourceDisplays
            : targetScene.displays;
      const targetEffects =
        source.type === 'effect'
          ? [
              ...(source.sceneId === target.sceneId ? sourceEffects : targetScene.effects),
              sourceItem,
            ]
          : source.sceneId === target.sceneId
            ? sourceEffects
            : targetScene.effects;

      updateScenes(currentScenes =>
        currentScenes.map(scene => {
          if (scene.id === source.sceneId && scene.id === target.sceneId) {
            return {
              ...scene,
              displays: targetDisplays,
              effects: targetEffects,
            };
          }

          if (scene.id === source.sceneId) {
            return {
              ...scene,
              displays: sourceDisplays,
              effects: sourceEffects,
            };
          }

          if (scene.id === target.sceneId) {
            return {
              ...scene,
              displays: targetDisplays,
              effects: targetEffects,
            };
          }

          return scene;
        }),
      );

      const element = stage.getStageElementById(sourceId);
      const sourceSceneInstance = stage.getSceneById(source.sceneId);
      const targetSceneInstance = stage.getSceneById(target.sceneId);
      const targetIndex =
        source.type === 'display'
          ? targetDisplays.findIndex(display => display.id === sourceId)
          : targetEffects.length - 1;

      if (!element || !sourceSceneInstance || !targetSceneInstance) {
        return true;
      }

      sourceSceneInstance.removeElement(element);
      targetSceneInstance.addElement(element, targetIndex);
      return true;
    }

    if (source.type === 'scene') {
      updateScenes(currentScenes => moveAtIndex(currentScenes, source.index, target.index));

      const scene = stage.getSceneById(sourceId);
      if (!scene) {
        return true;
      }

      const offset = target.index - source.index;
      const direction = Math.sign(offset);
      const distance = Math.abs(offset);

      for (let i = 0; i < distance; i += 1) {
        stage.shiftStageElement(scene, direction);
      }

      return true;
    }
  }

  if (source.type !== target.type) {
    return false;
  }

  if (source.type === 'display' && source.renderGroup !== target.renderGroup) {
    return false;
  }

  if (source.sceneId !== target.sceneId) {
    const targetCollection = getElementTarget(source.type);
    const sourceScene = scenes.find(scene => scene.id === source.sceneId);
    const targetScene = scenes.find(scene => scene.id === target.sceneId);
    const sourceItem = sourceScene?.[targetCollection]?.[source.index];

    if (!sourceScene || !targetScene || !sourceItem) {
      return false;
    }

    updateScenes(currentScenes =>
      currentScenes.map(scene => {
        if (scene.id === source.sceneId) {
          return {
            ...scene,
            [targetCollection]: scene[targetCollection].filter(item => item.id !== sourceId),
          };
        }

        if (scene.id === target.sceneId) {
          return {
            ...scene,
            [targetCollection]:
              source.type === 'display'
                ? insertDisplayAtRenderGroup(scene[targetCollection], sourceItem, target.groupIndex)
                : insertAtIndex(scene[targetCollection], target.index, sourceItem),
          };
        }

        return scene;
      }),
    );

    const element = stage.getStageElementById(sourceId);
    const sourceSceneInstance = stage.getSceneById(source.sceneId);
    const targetSceneInstance = stage.getSceneById(target.sceneId);
    const targetIndex =
      source.type === 'display'
        ? insertDisplayAtRenderGroup(
            targetScene[targetCollection],
            sourceItem,
            target.groupIndex,
          ).findIndex(display => display.id === sourceId)
        : target.index;

    if (!element || !sourceSceneInstance || !targetSceneInstance) {
      return true;
    }

    sourceSceneInstance.removeElement(element);
    targetSceneInstance.addElement(element, targetIndex);
    return true;
  }

  if (source.type === 'display') {
    const sourceScene = scenes.find(scene => scene.id === source.sceneId);
    if (!sourceScene) {
      return false;
    }

    const nextDisplays = moveDisplayWithinRenderGroup(
      sourceScene.displays,
      source.index,
      target.groupIndex,
    );

    updateScenes(currentScenes =>
      currentScenes.map(scene =>
        scene.id === source.sceneId ? { ...scene, displays: nextDisplays } : scene,
      ),
    );

    const element = stage.getStageElementById(sourceId);
    const sceneInstance = stage.getSceneById(source.sceneId);
    const targetIndex = nextDisplays.findIndex(display => display.id === sourceId);

    if (element && sceneInstance && targetIndex > -1) {
      sceneInstance.removeElement(element);
      sceneInstance.addElement(element, targetIndex);
    }

    return true;
  }

  updateScenes(currentScenes =>
    currentScenes.map(scene => {
      if (scene.id !== source.sceneId) {
        return scene;
      }

      return {
        ...scene,
        effects: moveAtIndex(scene.effects, source.index, target.index),
      };
    }),
  );

  const element = stage.getStageElementById(sourceId);
  if (!element) {
    return true;
  }

  const offset = target.index - source.index;
  const direction = Math.sign(offset);
  const distance = Math.abs(offset);

  for (let i = 0; i < distance; i += 1) {
    stage.shiftStageElement(element, direction);
  }

  return true;
}

export function getScenesSnapshot() {
  return structuredClone(sceneStore.getState().scenes);
}

export default sceneStore;
