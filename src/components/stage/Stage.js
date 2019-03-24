import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import withAppContext from 'components/hocs/withAppContext';
import RenderInfo from 'components/stage/RenderInfo';
import { events } from 'app/global';
import { FirstChild } from 'utils/react';
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

class Stage extends Component {
  state = {
    loading: false,
    rendering: false,
    ...this.props.app.stage.options,
  };

  componentDidMount() {
    this.props.app.stage.init(this.canvas);

    events.on('zoom', this.updateStage, this);
    events.on('audio-file-load', this.showLoading, this);
    events.on('audio-file-loaded', this.hideLoading, this);
    events.on('video-render-start', this.startRender, this);
    events.on('video-render-complete', this.stopRender, this);
  }

  componentWillUnmount() {
    events.off('zoom', this.updateStage);
    events.off('audio-file-load', this.showLoading);
    events.off('audio-file-loaded', this.hideLoading);
    events.off('video-render-start', this.startRender);
    events.off('video-render-complete', this.stopRender);
  }

  handleDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  handleDrop = e => {
    e.stopPropagation();
    e.preventDefault();

    const { app } = this.props;
    const { rendering } = this.state;

    const file = e.dataTransfer.files[0];

    if (file && !rendering) {
      app.loadAudioFile(file.path);
    }
  };

  startRender = () => this.setState({ rendering: true });

  stopRender = () => this.setState({ rendering: false });

  showLoading = () => this.setState({ loading: true });

  hideLoading = () => this.setState({ loading: false });

  updateStage = () => this.setState({ ...this.props.app.stage.options });

  render() {
    const { loading, rendering, width, height, zoom } = this.state;

    const style = {
      width: `${width * zoom}px`,
      height: `${height * zoom}px`,
    };

    return (
      <div className={styles.stage}>
        <div className={styles.scroll}>
          <div className={styles.canvas} onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
            <canvas ref={e => (this.canvas = e)} style={style} />
            <Loading visible={loading} />
            <Rendering visible={rendering} onButtonClick={this.stopRender} />
          </div>
        </div>
      </div>
    );
  }
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

const Rendering = ({ visible, onButtonClick }) => (
  <TransitionGroup component={FirstChild}>
    {visible && (
      <CSSTransition classNames={transitionClasses} timeout={transitionTimeout}>
        <RenderInfo className={styles.renderInfo} onButtonClick={onButtonClick} />
      </CSSTransition>
    )}
  </TransitionGroup>
);

export default withAppContext(Stage);
