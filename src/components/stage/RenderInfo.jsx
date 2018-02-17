import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Button from 'components/interface/Button';
import { formatTime } from 'utils/format';
import styles from './RenderInfo.less';

export default class RenderInfo extends React.Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    constructor(props, context) {
        super(props);

        this.state = {
            complete: false,
            frames: 0,
            currentFrame: 0,
            lastFrame: 0,
            startTime: 0,
        };

        this.app = context.app;
    }

    componentWillMount() {
        if (!this.app.renderer) return;

        this.renderer = this.app.renderer;
        this.renderer.on('ready', this.processInfo, this);
        this.renderer.on('complete', this.setComplete, this);
    }

    componentDidMount() {
        if (this.renderer) {
            this.renderer.start();
        }
    }

    componentWillUnmount() {
        if (this.renderer) {
            this.renderer.off('ready', this.processInfo, this);
            this.renderer.off('complete', this.setComplete, this);
        }
    }

    onButtonClick = () => {
        if (this.renderer) {
            this.renderer.stop();
        }

        if (this.props.onButtonClick) {
            this.props.onButtonClick();
        }
    }

    setComplete() {
        this.setState({ complete: true });
    }

    processInfo() {
        const {
            frames, currentFrame, lastFrame, startTime,
        } = this.renderer;

        this.setState({
            frames,
            currentFrame,
            lastFrame,
            startTime,
        });
    }

    render() {
        const {
            frames,
            currentFrame,
            lastFrame,
            startTime,
            complete,
        } = this.state;

        const { className } = this.props;

        const elapsedTime = (window.performance.now() - startTime) / 1000;
        const frame = frames - (lastFrame - currentFrame);
        const progress = frames > 0 ? (frame / frames) * 100 : 0;
        const fps = elapsedTime > 0 ? frame / elapsedTime : 0;
        const text = complete ? 'Finished' : 'Cancel';
        const style = { width: `${progress}%` };

        return (
            <div className={classNames(styles.renderInfo, className)}>
                <div className={styles.progress}>
                    <div className={styles.progressBar} style={style} />
                </div>
                <div className={styles.stats}>
                    <Stat label="Progress" value={`${~~progress}%`} />
                    <Stat label="Elapsed Time" value={formatTime(elapsedTime)} />
                    <Stat label="Frames" value={`${~~frame} / ${~~frames}`} />
                    <Stat label="Progress" value={fps.toFixed(1)} />
                    <Button text={text} onClick={this.onButtonClick} />
                </div>
            </div>
        );
    }
}

const Stat = ({ label, value }) => (
    <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        {value}
    </div>
);
