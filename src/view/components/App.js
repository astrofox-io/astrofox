import { hot } from 'react-hot-loader';
import React, { useEffect, useMemo } from 'react';
import { api, renderer, reactors } from 'view/global';
import { ignoreEvents } from 'utils/react';
import Layout from 'components/layout/Layout';
import Modals from 'components/window/Modals';
import Preload from 'components/window/Preload';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import ControlDock from 'components/panels/ControlDock';
import Player from 'components/player/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import useApp, { initApp, exitApp, toggleState, saveImage } from 'actions/app';
import { showModal } from 'actions/modals';
import { setZoom } from 'actions/stage';
import { openAudioFile } from 'actions/audio';
import useProject, {
  openProjectFile,
  saveProjectFile,
  newProject,
  checkUnsavedChanges,
} from 'actions/project';

function App() {
  const projectFile = useProject(state => state.file);
  const activeReactorId = useApp(state => state.activeReactorId);
  const reactor = useMemo(() => reactors.getElementById(activeReactorId), [activeReactorId]);

  async function handleMenuAction(action) {
    switch (action) {
      case 'new-project':
        await checkUnsavedChanges(action, newProject);
        break;

      case 'open-project':
        await checkUnsavedChanges(action, openProjectFile);
        break;

      case 'save-project':
        await saveProjectFile(projectFile);
        break;

      case 'save-project-as':
        await saveProjectFile();
        break;

      case 'load-audio':
        await openAudioFile();
        break;

      case 'save-image':
        await saveImage();
        break;

      case 'save-video':
        await showModal('VideoSettings', { title: 'Save Video' });
        break;

      case 'edit-canvas':
        await showModal('CanvasSettings', { title: 'Canvas' });
        break;

      case 'edit-settings':
        await showModal('AppSettings', { title: 'Settings' });
        break;

      case 'zoom-in':
        await setZoom(1);
        break;

      case 'zoom-out':
        await setZoom(-1);
        break;

      case 'zoom-reset':
        await setZoom(0);
        break;

      case 'view-control-dock':
        await toggleState('showControlDock');
        break;

      case 'view-player':
        await toggleState('showPlayer');
        break;

      case 'check-for-updates':
        await showModal('AppUpdates', { title: 'Updates' });
        break;

      case 'open-dev-tools':
        api.openDevTools();
        break;

      case 'about':
        await showModal('About');
        break;

      case 'exit':
        await exitApp();
        break;
    }
  }

  async function init() {
    await initApp();
    api.on('menu-action', handleMenuAction);
    renderer.start();
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <Layout direction="column" onDrop={ignoreEvents} onDragOver={ignoreEvents} full>
      <Preload />
      <TitleBar onMenuAction={handleMenuAction} />
      <Layout direction="row">
        <Layout direction="column">
          <Stage />
          <Player />
          {reactor && <ReactorControl reactor={reactor} />}
        </Layout>
        <ControlDock />
      </Layout>
      <StatusBar />
      <Modals />
    </Layout>
  );
}

export default hot(module)(App);
