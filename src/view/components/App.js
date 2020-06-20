import { hot } from 'react-hot-loader';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { api, renderer, reactors } from 'view/global';
import { ignoreEvents } from 'utils/react';
import Layout from 'components/layout/Layout';
import Modals from 'components/window/Modals';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import ControlDock from 'components/panels/ControlDock';
import Player from 'components/player/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import { initApp, exitApp, toggleState, saveImage } from 'actions/app';
import { showModal } from 'actions/modals';
import { updateZoom } from 'actions/stage';
import { openAudioFile } from 'actions/audio';
import { openProjectFile, saveProjectFile, newProject, checkUnsavedChanges } from 'actions/project';

const getActiveReactor = createSelector(
  state => state.app.activeReactorId,
  reactorId => reactors.getElementById(reactorId),
);

function App() {
  const dispatch = useDispatch();
  const projectFile = useSelector(state => state.project.file);
  const reactor = useSelector(getActiveReactor);

  function handleMenuAction(action) {
    switch (action) {
      case 'new-project':
        dispatch(checkUnsavedChanges(action, newProject()));
        break;

      case 'open-project':
        dispatch(checkUnsavedChanges(action, openProjectFile()));
        break;

      case 'save-project':
        dispatch(saveProjectFile(projectFile));
        break;

      case 'save-project-as':
        dispatch(saveProjectFile());
        break;

      case 'load-audio':
        dispatch(openAudioFile());
        break;

      case 'save-image':
        dispatch(saveImage());
        break;

      case 'save-video':
        dispatch(showModal('VideoSettings', { title: 'Save Video' }));
        break;

      case 'edit-canvas':
        dispatch(showModal('CanvasSettings', { title: 'Canvas' }));
        break;

      case 'edit-settings':
        dispatch(showModal('AppSettings', { title: 'Settings' }));
        break;

      case 'zoom-in':
        dispatch(updateZoom(1));
        break;

      case 'zoom-out':
        dispatch(updateZoom(-1));
        break;

      case 'zoom-reset':
        dispatch(updateZoom(0));
        break;

      case 'view-control-dock':
        dispatch(toggleState('showControlDock'));
        break;

      case 'view-player':
        dispatch(toggleState('showPlayer'));
        break;

      case 'check-for-updates':
        dispatch(showModal('AppUpdates', { title: 'Updates' }));
        break;

      case 'about':
        dispatch(showModal('About'));
        break;

      case 'exit':
        dispatch(exitApp());
        break;
    }
  }

  useEffect(() => {
    dispatch(initApp()).then(() => {
      api.on('menu-action', handleMenuAction);
      renderer.start();
    });
  }, []);

  return (
    <Layout direction="column" onDrop={ignoreEvents} onDragOver={ignoreEvents} full>
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
