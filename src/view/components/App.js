import { hot } from 'react-hot-loader/root';
import React, { useEffect } from 'react';
import * as global from 'view/global';
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
import { initApp } from 'actions/app';

function App() {
  async function init() {
    await initApp();

    global.renderer.start();
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <Layout direction="column" onDrop={ignoreEvents} onDragOver={ignoreEvents} full>
      <Preload />
      <TitleBar />
      <Layout direction="row">
        <Layout direction="column">
          <Stage />
          <Player />
          <ReactorControl />
        </Layout>
        <ControlDock />
      </Layout>
      <StatusBar />
      <Modals />
    </Layout>
  );
}

export default hot(App);
