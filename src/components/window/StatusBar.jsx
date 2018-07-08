import React, { Component } from 'react';
import { APP_VERSION } from 'core/Environment';
import { events } from 'core/Global';
import { formatSize } from 'utils/format';
import withAppContext from 'components/hocs/withAppContext';
import styles from './StatusBar.less';

class StatusBar extends Component {
    state = {
        fps: 0,
        zoom: 1,
    }

    componentDidMount() {
        events.on('tick', this.updateStats, this);
    }

    componentWillUnmount() {
        events.off('tick', this.updateStats, this);
    }

    updateStats = ({ fps }) => this.setState({ fps });

    setZoom = (value) => {
        const { app: { stage } } = this.props;

        stage.setZoom(value);

        this.setState({ zoom: stage.options.zoom });
    }

    render() {
        let memSize;
        let electronVersion;
        const { app: { stage }, text } = this.props;
        const { fps, zoom } = this.state;

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
                    <Zoom
                        value={zoom}
                        width={stage.options.width}
                        height={stage.options.height}
                        onChange={this.setZoom}
                    />
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

const Zoom = ({ width, height, value, onChange }) => (
    <div className={styles.zoom}>
        <span className={styles.item}>
            {`${width} x ${height}`}
        </span>
        <span className={styles.zoomButton} onClick={() => onChange(-1)}>
            -
        </span>
        <span className={styles.zoomValue}>
            {`${value * 100}%`}
        </span>
        <span className={styles.zoomButton} onClick={() => onChange(1)}>
            +
        </span>
    </div>
);

export default withAppContext(StatusBar);
