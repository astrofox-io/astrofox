import { hot } from 'react-hot-loader';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { env, events, renderer } from 'view/global';
import { ignoreEvents } from 'utils/react';
import About from 'components/window/About';
import AppUpdates from 'components/window/AppUpdates';
import Dialog from 'components/window/Dialog';
import ModalWindow from 'components/window/ModalWindow';
import Overlay from 'components/window/Overlay';
import ControlPicker from 'components/window/ControlPicker';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import AppSettings from 'components/settings/AppSettings';
import CanvasSettings from 'components/settings/CanvasSettings';
import VideoSettings from 'components/settings/VideoSettings';
import ControlDock from 'components/panels/ControlDock';
import MenuBar from 'components/nav/MenuBar';
import Player from 'components/audio/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import menuConfig from 'config/menu.json';
import fontOptions from 'config/fonts.json';
import { showOpenDialog, showSaveDialog } from 'utils/window';
import { initApp, updateApp, toggleState } from 'actions/app';
import { loadAudioFile } from 'actions/audio';
import { loadProject, saveProject, newProject } from 'actions/project';
import styles from './App.less';

function App() {
  const dispatch = useDispatch();
  const project = useSelector(state => state.project);
  const errors = useSelector(state => state.errors);

  function openProject() {
    showOpenDialog(
      files => {
        if (files) {
          dispatch(loadProject(files[0]));
        }
      },
      {
        filters: [{ name: 'Project files', extensions: ['afx'] }],
      },
    );
  }

  function saveProjectFile(file) {
    if (file) {
      dispatch(saveProject(file));
    } else {
      showSaveDialog(
        filename => {
          if (filename) {
            dispatch(saveProject(filename));
          }
        },
        { defaultPath: 'project.afx' },
      );
    }
  }

  function openAudioFile() {
    showOpenDialog(
      files => {
        if (files) {
          dispatch(loadAudioFile(files[0]));
        }
      },
      {
        filters: [
          {
            name: 'audio files',
            extensions: ['aac', 'mp3', 'm4a', 'ogg', 'wav'],
          },
        ],
      },
    );
  }

  function handleMenuAction(action) {
    switch (action) {
      case 'new-project':
        dispatch(newProject());
        break;

      case 'open-project':
        openProject();
        break;

      case 'save-project':
        saveProjectFile(project.file);
        break;

      case 'save-project-as':
        saveProjectFile(null);
        break;

      case 'load-audio':
        openAudioFile();
        break;

      case 'save-image':
        app.saveImage();
        break;

      case 'save-video':
        this.showModal(<VideoSettings onStart={this.startVideoRender} />, {
          title: 'Save Video',
          buttons: false,
        });
        break;

      case 'edit-canvas':
        this.showModal(<CanvasSettings />, { title: 'canvas', buttons: false });
        break;

      case 'edit-settings':
        this.showModal(<AppSettings />, { title: 'Settings', buttons: false });
        break;

      case 'zoom-in':
        app.stage.setZoom(1);
        break;

      case 'zoom-out':
        app.stage.setZoom(-1);
        break;

      case 'zoom-reset':
        app.stage.setZoom(0);
        break;

      case 'view-control-dock':
        dispatch(toggleState('showControlDock'));
        break;

      case 'view-player':
        dispatch(toggleState('showPlayer'));
        break;

      case 'check-for-updates':
        this.showCheckForUpdates();
        break;

      case 'about':
        this.showModal(<About />, { title: false, buttons: false });
        break;

      case 'exit':
        app.exit();
        break;
    }
  }

  const handleUnsavedChanges = callback => {
    const { app } = this.props;

    this.showDialog(
      {
        message: 'Do you want to save project changes before closing?',
      },
      {
        title: 'Unsaved Changes',
        buttons: ['Yes', 'No', 'Cancel'],
      },
      button => {
        if (button === 'Yes') {
          app.saveProject(app.projectFile, callback);
        } else if (button === 'No') {
          callback();
        }
      },
    );
  };

  const showModal = (content, props) => {
    if (this.dialogShown) return;

    this.setState(({ modals }) => ({
      modals: modals.concat([
        <ModalWindow
          key={modals.length}
          onClose={() => this.hideModal()}
          buttons={['OK']}
          {...props}
        >
          {content}
        </ModalWindow>,
      ]),
    }));
  };

  const hideModal = callback => {
    this.setState(({ modals }) => {
      modals.pop();
      return { modals };
    }, callback);
  };

  const showDialog = ({ icon, message }, props, callback) => {
    if (this.dialogShown) return;

    this.showModal(<Dialog icon={icon} message={message} />, {
      onClose: button => {
        this.hideModal();
        this.dialogShown = false;
        if (callback) callback(button);
      },
      ...props,
    });

    this.dialogShown = true;
  };

  const showErrorDialog = message => {
    this.showDialog({
      title: 'Error',
      icon: 'icon-warning',
      message,
    });
  };

  const showCheckForUpdates = () => {
    if (this.updatesShown) return;

    this.updatesShown = true;

    const onClose = () => {
      this.hideModal();
      this.updatesShown = false;
    };

    this.showModal(<AppUpdates />, { title: 'Updates', buttons: false, onClose });
  };

  const _showReactor = reactor => {
    this.setState(() => ({
      reactor,
      showReactor: reactor,
    }));
  };

  const startVideoRender = ({ videoFile, audioFile, ...properties }) => {
    const { app } = this.props;

    this.hideModal(() => {
      app.saveVideo(videoFile, audioFile, properties);
    });
  };

  const loadControlPicker = (type, callback) => {
    this.showModal(<ControlPicker type={type} onControlPicked={callback} />, {
      title: 'Add Control',
      buttons: ['Close'],
    });
  };

  useEffect(() => {
    /*
    events.on('error', this.showErrorDialog);
    events.on('pick-control', this.loadControlPicker);
    events.on('audio-tags', this.loadAudioTags);
    events.on('menu-action', this.handleMenuAction);
    events.on('unsaved-changes', this.handleUnsavedChanges);
    events.on('reactor-edit', this.showReactor);
    events.on('has-app-update', this.showCheckForUpdates);
    */
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
      <Overlay></Overlay>
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
