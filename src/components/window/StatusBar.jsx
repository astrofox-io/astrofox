import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { APP_VERSION } from 'core/Environment';
import { events } from 'core/Global';
import { formatSize } from 'utils/format';
import styles from './StatusBar.less';

export default class StatusBar extends Component {
    state = {
        fps: 0,
    }

    componentDidMount() {
        events.on('tick', this.updateStats, this);
    }

    componentWillUnmount() {
        events.off('tick', this.updateStats, this);
    }

    updateStats(stats) {
        this.setState({ fps: stats.fps });
    }

    render() {
        let memSize;
        let electronVersion;
        const { text } = this.props;
        const { fps } = this.state;

        if (process.env.NODE_ENV !== 'production') {
            memSize = formatSize(window.performance.memory.usedJSHeapSize, 2);
            electronVersion = process.versions.electron;
        }

        return (
            <div className={styles.statusBar}>
                <div className={styles.left}>
                    <span className={styles.item}>
                        {text}
                    </span>
                </div>
                <div className={styles.center}>
                    <Zoom />
                </div>
                <div className={styles.right}>
                    <span className={styles.item}>
                        {memSize}
                    </span>
                    <span className={styles.item}>
                        {electronVersion}
                    </span>
                    <span className={styles.item}>
                        {`${fps} FPS`}
                    </span>
                    <span className={styles.item}>
                        {APP_VERSION}
                    </span>
                </div>
            </div>
        );
    }
}

class Zoom extends React.Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    constructor(props, context) {
        super(props);

        this.app = context.app;
    }

    componentDidMount() {
        events.on('zoom', this.forceUpdate, this);
    }

    componentWillUnmount() {
        events.off('zoom', this.forceUpdate, this);
    }

    setZoom(val) {
        this.app.stage.setZoom(val);
        this.forceUpdate();
    }

    render() {
        const { width, height, zoom } = this.app.stage.options;

        return (
            <div className={styles.zoom}>
                <span className={styles.item}>
                    {`${width} x ${height}`}
                </span>
                <span className={styles.zoomButton} onClick={() => this.setZoom(-1)}>
                    -
                </span>
                <span className={styles.zoomValue}>
                    {`${zoom * 100}%`}
                </span>
                <span className={styles.zoomButton} onClick={() => this.setZoom(1)}>
                    +
                </span>
            </div>
        );
    }
}
