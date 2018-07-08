import React, { Component } from 'react';
import classNames from 'classnames';
import withAppContext from 'components/hocs/withAppContext';
import Button from 'components/interface/Button';
import { formatTime } from 'utils/format';
import styles from './RenderInfo.less';

class RenderInfo extends Component {
    static defaultProps = {
        onButtonClick: () => {},
    }

    state = {
        complete: false,
        frames: 0,
        currentFrame: 0,
        lastFrame: 0,
        startTime: 0,
    }

    componentDidMount() {
        const { app: { renderer } } = this.props;

        this.renderer = renderer;
        this.renderer.on('ready', this.processInfo, this);
        this.renderer.on('complete', this.setComplete, this);

        this.renderer.start();
    }

    componentWillUnmount() {
        this.renderer.off('ready', this.processInfo, this);
        this.renderer.off('complete', this.setComplete, this);
    }

    onButtonClick = () => {
        this.renderer.stop();

        this.props.onButtonClick();
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
        <span className={styles.label}>
            {label}
        </span>
        {value}
    </div>
);

export default withAppContext(RenderInfo);
