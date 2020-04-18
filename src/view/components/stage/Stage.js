import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import RenderInfo from 'components/stage/RenderInfo';
import { stage } from 'view/global';
import { FirstChild } from 'utils/react';
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

    /*
    events.on('zoom', this.updateStage, this);
    events.on('audio-file-load', this.showLoading, this);
    events.on('audio-file-loaded', this.hideLoading, this);
    events.on('video-render-start', this.startRender, this);

    return () => {
      events.off('zoom', this.updateStage);
      events.off('audio-file-load', this.showLoading);
      events.off('audio-file-loaded', this.hideLoading);
      events.off('video-render-start', this.startRender);
    };
     */
  });

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file && !rendering) {
      dispatch(loadAudioFile(file.path));
    }
  }

  function startRender() {}

  function stopRender() {}

  const style = {
    width: `${width * zoom}px`,
    height: `${height * zoom}px`,
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
