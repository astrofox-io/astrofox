import { hot } from 'react-hot-loader';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { env, events, renderer } from 'view/global';
import { ignoreEvents } from 'utils/react';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import ControlDock from 'components/panels/ControlDock';
import MenuBar from 'components/nav/MenuBar';
import Player from 'components/audio/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import menuConfig from 'config/menu.json';
import fontOptions from 'config/fonts.json';
import { initApp, exitApp, toggleState, saveImage } from 'actions/app';
import { showModal } from 'actions/modals';
import { updateZoom } from 'actions/stage';
import { openAudioFile } from 'actions/audio';
import { openProject, saveProject, newProject, checkUnsavedChanges } from 'actions/project';
import styles from './App.less';
import Modals from './window/Modals';

function App() {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project);

  function handleMenuAction(action) {
    switch (action) {
      case 'new-project':
        dispatch(checkUnsavedChanges(action, newProject()));
        break;

      case 'open-project':
        dispatch(checkUnsavedChanges(action, openProject()));
        break;

      case 'save-project':
        dispatch(saveProject(project.file));
        break;

      case 'save-project-as':
        dispatch(saveProject());
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
      events.on('menu-action', handleMenuAction);
      renderer.start();
    });
  }, []);

  return (
    <div className={styles.container} onDrop={ignoreEvents} onDragOver={ignoreEvents}>
      <Preload />
      <TitleBar />
      {env.IS_WINDOWS && <MenuBar items={menuConfig} onMenuAction={handleMenuAction} />}
      <div className={styles.body}>
        <div className={styles.viewport}>
          <Stage />
          <Player />
          <ReactorControl />
        </div>
        <ControlDock />
      </div>
      <StatusBar />
      <Modals />
    </div>
  );
}

const Preload = () => (
  <div className={styles.preload}>
    {fontOptions.map((item, index) => (
      <div key={index} style={{ fontFamily: item }}>
        {item}
      </div>
    ))}
  </div>
);

export default hot(module)(App);
