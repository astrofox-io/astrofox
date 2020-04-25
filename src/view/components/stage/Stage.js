import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import RenderInfo from 'components/stage/RenderInfo';
import { stage } from 'view/global';
import { FirstChild } from 'utils/react';
import { updateStage } from 'actions/stage';
import { loadAudioFile } from 'actions/audio';
import styles from './Stage.less';

const transitionClasses = {
  enter: styles.stageEnter,
  enterActive: styles.stageEnterActive,
  exit: styles.stageExit,
  exitActive: styles.stageExitActive,
};

const transitionTimeout = {
  enter: 500,
  exit: 500,
};

export default function Stage() {
  const dispatch = useDispatch();
  const { loading, rendering, width, height, zoom } = useSelector(({ stage }) => stage);
  const canvas = useRef();

  useEffect(() => {
    stage.init(canvas.current);
  }, [stage]);

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  async function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file && !rendering) {
      await dispatch(updateStage({ loading: true }));
      await dispatch(loadAudioFile(file.path));
      await dispatch(updateStage({ loading: false }));
    }
  }

  function startRender() {}

  function stopRender() {}

  const style = {
    width: `${width * (zoom / 100)}px`,
    height: `${height * (zoom / 100)}px`,
  };

  return (
    <div className={styles.stage}>
      <div className={styles.scroll}>
        <div className={styles.canvas} onDrop={handleDrop} onDragOver={handleDragOver}>
          <canvas ref={canvas} style={style} />
          <Loading visible={loading} />
          <Rendering visible={rendering} onClose={stopRender} />
        </div>
      </div>
    </div>
  );
}

const Loading = ({ visible }) => (
  <TransitionGroup component={FirstChild}>
    {visible && (
      <CSSTransition classNames={transitionClasses} timeout={transitionTimeout}>
        <div className={styles.loading} />
      </CSSTransition>
    )}
  </TransitionGroup>
);

const Rendering = ({ visible, onClose }) => (
  <TransitionGroup component={FirstChild}>
    {visible && (
      <CSSTransition classNames={transitionClasses} timeout={transitionTimeout}>
        <RenderInfo className={styles.renderInfo} onClose={onClose} />
      </CSSTransition>
    )}
  </TransitionGroup>
);
