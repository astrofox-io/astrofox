import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';
import CanvasAudio from 'canvas/CanvasAudio';

export default class AudioWaveform extends UIComponent {
    constructor(props) {
        super(props);

        this.canvas = null;
        this.drawContext = null;
    }

    componentDidMount() {
        this.drawContext = this.canvas.getContext('2d');
        this.position = 0;
        this.seek = 0;

        // Create canvases
        this.baseCanvas = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#555555','#444444'],
                shadowColor: '#333333'
            })
        );

        this.progressCanvas = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#B6AAFF','#927FFF'],
                shadowColor: '#554B96'
            })
        );

        this.seekCanvas = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#8880BF','#6C5FBF'],
                shadowColor: '#403972'
            })
        );
    }

    onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.onClick) {
            let rect = e.currentTarget.getBoundingClientRect();

            this.props.onClick((e.clientX - rect.left) / rect.width);
        }
    }

    onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();

        let rect = e.currentTarget.getBoundingClientRect();

        this.seek = (e.clientX - rect.left) / rect.width;
        this.draw();
    }

    onMouseOut(e) {
        e.stopPropagation();
        e.preventDefault();

        this.seek = 0;
        this.draw();
    }

    draw() {
        let { width, height } = this.canvas,
            context = this.drawContext,
            position = this.position * width,
            seek = this.seek * width,
            sx = (seek < position) ? seek : position,
            dx = (seek < position) ? position - seek : seek - position;

        context.clearRect(0, 0, width, height);

        context.drawImage(
            this.baseCanvas.getCanvas(),
            position, 0, width - position, height,
            position, 0, width - position, height
        );

        if (position > 0) {
            context.drawImage(
                this.progressCanvas.getCanvas(),
                0, 0, position, height,
                0, 0, position, height
            );
        }

        if (seek > 0) {
            context.drawImage(
                this.seekCanvas.getCanvas(),
                sx, 0, dx, height,
                sx, 0, dx, height
            );
        }
    }

    renderBars(audio) {
        if (audio) {
            this.baseCanvas.render(audio.buffer);
            this.progressCanvas.render(audio.buffer);
            this.seekCanvas.render(audio.buffer);
        }
    }

    render() {
        let width = this.props.width,
            height = this.props.height + this.props.shadowHeight,
            classes = {
                'waveform': true,
                'waveform-hidden': !this.props.visible
            };

        return (
            <div className={classNames(classes)}>
                <canvas
                    ref={el => this.canvas = el}
                    className="canvas"
                    width={width}
                    height={height}
                    onClick={this.onClick}
                    onMouseMove={this.onMouseMove}
                    onMouseOut={this.onMouseOut}
                />
            </div>
        );
    }
}

AudioWaveform.defaultProps = {
    visible: true,
    width: 854,
    height: 70,
    barWidth: 3,
    barSpacing: 1,
    shadowHeight: 30,
    bgColor: '#333333',
    bars: 213
};