import create from 'zustand';
import { stage } from 'global';
import { touchProject } from './project';

const initialState = {
  scenes: [],
  activeElement: null,
};

const sceneStore = create(() => ({
  ...initialState,
}));

export function setActiveElement(element) {
  sceneStore.setState({ activeElement: element });
}

export function loadScenes() {
  sceneStore.setState({ scenes: stage.scenes.toJSON() });

  touchProject();
}

export function resetScenes() {
  stage.clearScenes();

  touchProject();
}

export function addScene() {
  const scene = stage.addScene();

  loadScenes();

  return scene;
}

export function addElement(element, scene = stage.scenes[0]) {
  if (scene) {
    scene.addElement(element);
  }

  loadScenes();
}

export function updateElement(id, prop, value) {
  const element = stage.getStageElementById(id);

  if (element) {
    element.update({ [prop]: value });

    loadScenes();
  }
}

export function removeElement(id) {
  const element = stage.getStageElementById(id);

  if (element) {
    stage.removeStageElement(element);

    loadScenes();
  }
}

export function moveElement(id, spaces) {
  const element = stage.getStageElementById(id);

  if (element) {
    stage.shiftStageElement(element, spaces);

    loadScenes();
  }
}

export default sceneStore;
