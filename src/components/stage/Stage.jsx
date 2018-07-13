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
    }

    componentDidMount() {
        this.props.app.stage.init(this.canvas);

        events.on('zoom', this.updateStage, this);
    }

    componentWillUnmount() {
        events.off('zoom', this.updateStage, this);
    }

    onDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { onFileDropped } = this.props;
        const file = e.dataTransfer.files[0];

        if (file && onFileDropped) {
            onFileDropped(file.path);
        }
    }

    startRender = () => this.setState({ rendering: true });

    stopRender = () => this.setState({ rendering: false });

    showLoading = loading => this.setState({ loading });

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
                    <div
                        className={styles.canvas}
                        onDrop={this.onDrop}
                        onDragOver={this.onDragOver}
                    >
                        <canvas
                            ref={e => (this.canvas = e)}
                            style={style}
                        />
                        <Loading visible={loading} />
                        <Rendering
                            visible={rendering}
                            onButtonClick={this.stopRender}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const Loading = ({ visible }) => (
    <TransitionGroup component={FirstChild}>
        {
            visible && (
                <CSSTransition
                    classNames={transitionClasses}
                    timeout={transitionTimeout}
                >
                    <div className={styles.loading} />
                </CSSTransition>
            )
        }
    </TransitionGroup>
);

const Rendering = ({ visible, onButtonClick }) => (
    <TransitionGroup component={FirstChild}>
        {
            visible && (
                <CSSTransition
                    classNames={transitionClasses}
                    timeout={transitionTimeout}
                >
                    <RenderInfo className={styles.renderInfo} onButtonClick={onButtonClick} />
                </CSSTransition>
            )
        }
    </TransitionGroup>
);

export default withAppContext(Stage);
