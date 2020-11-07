import shallow from 'zustand/shallow';
import React, { useEffect, useRef } from 'react';
import { useTransition, animated } from 'react-spring';
import RenderPanel from 'components/panels/RenderPanel';
import Overlay from 'components/window/Overlay';
import { stage } from 'view/global';
import { ignoreEvents } from 'utils/react';
import useStage from 'actions/stage';
import useVideo, { stopRender } from 'actions/video';
import useAudioStore, { loadAudioFile } from 'actions/audio';
import styles from './Stage.less';

export default function Stage() {
  const [width, height, zoom] = useStage(state => [state.width, state.height, state.zoom], shallow);
  const rendering = useVideo(state => state.rendering);
  const canvas = useRef(null);
  const loading = useAudioStore(state => state.loading);

  useEffect(() => {
    console.log('STAGE INIT');
    stage.init(canvas.current);
  }, []);

  async function handleDrop(e) {
    ignoreEvents(e);

    const file = e.dataTransfer.files[0];

    if (file && !rendering) {
      await loadAudioFile(file.path);
    }
  }

  async function handleRenderClose() {
    await stopRender();
  }

  const style = {
    width: `${width * (zoom / 100)}px`,
    height: `${height * (zoom / 100)}px`,
  };

  return (
    <div className={styles.stage}>
      <Overlay show={rendering} />
      <div className={styles.scroll}>
        <div className={styles.canvas} onDrop={handleDrop} onDragOver={ignoreEvents}>
          <canvas ref={canvas} style={style} />
          <Loading show={loading} />
          <RenderInfo show={rendering} onClose={handleRenderClose} />
        </div>
      </div>
    </div>
  );
}

const Loading = ({ show }) => {
  const transitions = useTransition(show, 0, {
    from: { opacity: 0, width: '200px', height: '200px', margin: '-100px 0 0 -100px' },
    enter: { opacity: 1, width: '100px', height: '100px', margin: '-50px 0 0 -50px' },
    leave: { opacity: 0, width: '200px', height: '200px', margin: '-100px 0 0 -100px' },
  });

  return transitions.map(
    ({ item, key, props }) =>
      item && <animated.div key={key} className={styles.loading} style={props} />,
  );
};

const RenderInfo = ({ show, onClose }) => {
  const transitions = useTransition(show, 0, {
    from: { opacity: 0, maxHeight: 0 },
    enter: { opacity: 1, maxHeight: 100 },
    leave: { opacity: 0, maxHeight: 0 },
  });

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <animated.div key={key} className={styles.renderInfo} style={props}>
          <RenderPanel onClose={onClose} />
        </animated.div>
      ),
  );
};
