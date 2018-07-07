import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import RenderInfo from 'components/stage/RenderInfo';
import { events } from 'core/Global';
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

export default class Stage extends Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    constructor(props, context) {
        super(props);

        this.state = {
            loading: false,
            rendering: false,
        };

        this.app = context.app;
        this.canvas = null;
    }

    componentDidMount() {
        this.app.stage.init(this.canvas);

        events.on('zoom', this.forceUpdate, this);
    }

    componentWillUnmount() {
        events.off('zoom', this.forceUpdate, this);
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

    startRender = () => {
        this.setState({ rendering: true });
    }

    stopRender = () => {
        this.setState({ rendering: false });
    }

    showLoading = (value) => {
        this.setState({ loading: value });
    }

    render() {
        const { loading, rendering } = this.state;
        const { width, height, zoom } = this.app.stage.options;
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
