import React, { PureComponent } from 'react';
import classNames from 'classnames';
import CanvasAudio from 'canvas/CanvasAudio';
import { CANVAS_WIDTH } from 'app/constants';
import styles from './AudioWaveform.less';

export default class AudioWaveform extends PureComponent {
    static defaultProps = {
        visible: true,
        width: CANVAS_WIDTH,
        height: 70,
        barWidth: 3,
        barSpacing: 1,
        shadowHeight: 30,
        bgColor: '#333333',
        bars: 213,
        progressPosition: 0,
        seekPosition: 0,
        onClick: () => {},
        onSeek: () => {},
    }

    componentDidMount() {
        this.drawContext = this.canvas.getContext('2d');

        // Create canvases
        this.baseCanvas = new CanvasAudio({
            ...this.props,
            color: ['#555555', '#444444'],
            shadowColor: '#333333',
        });

        this.progressCanvas = new CanvasAudio({
            ...this.props,
            color: ['#B6AAFF', '#927FFF'],
            shadowColor: '#554B96',
        });

        this.seekCanvas = new CanvasAudio({
            ...this.props,
            color: ['#8880BF', '#6C5FBF'],
            shadowColor: '#403972',
        });
    }

    componentDidUpdate() {
        this.draw();
    }

    handleClick = (e) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        this.props.onClick((e.clientX - rect.left) / rect.width);
    }

    handleMouseMove = (e) => {
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        this.props.onSeek((e.clientX - rect.left) / rect.width);
    }

    handleMouseOut = (e) => {
        e.stopPropagation();

        this.props.onSeek(0);
    }

    draw = () => {
        const { width, height } = this.canvas;
        const { progressPosition, seekPosition } = this.props;

        const context = this.drawContext;
        const position = progressPosition * width;
        const seek = seekPosition * width;
        const sx = (seek < position) ? seek : position;
        const dx = (seek < position) ? position - seek : seek - position;

        context.clearRect(0, 0, width, height);

        context.drawImage(
            this.baseCanvas.getCanvas(),
            position, 0, width - position, height,
            position, 0, width - position, height,
        );

        if (position > 0) {
            context.drawImage(
                this.progressCanvas.getCanvas(),
                0, 0, position, height,
                0, 0, position, height,
            );
        }

        if (seek > 0) {
            context.drawImage(
                this.seekCanvas.getCanvas(),
                sx, 0, dx, height,
                sx, 0, dx, height,
            );
        }
    }

    loadAudio = ({ buffer }) => {
        this.baseCanvas.render(buffer);
        this.progressCanvas.render(buffer);
        this.seekCanvas.render(buffer);
    }

    render() {
        const {
            width, height, shadowHeight, visible,
        } = this.props;

        return (
            <div className={classNames({
                [styles.waveform]: true,
                [styles.hidden]: !visible,
            })}
            >
                <canvas
                    ref={e => (this.canvas = e)}
                    className={styles.canvas}
                    width={width}
                    height={height + shadowHeight}
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseOut={this.handleMouseOut}
                />
            </div>
        );
    }
}
