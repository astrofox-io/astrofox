import React from 'react';
import propTypes from 'prop-types';

import UIComponent from '../UIComponent';
import Button from '../interface/Button';
import { formatTime } from '../../util/format';

export default class RenderInfo extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            complete: false,
            fps: 0,
            frames: 0,
            currentFrame: 0,
            lastFrame: 0,
            startTime: 0,
            elapsedTime: 0
        };

        this.app = context.app;
    }

    componentWillMount() {
        if (!this.app.renderer) return;

        this.renderer = this.app.renderer;
        this.renderer.on('ready', this.processInfo, this);
        this.renderer.on('complete', this.setComplete, this);
    }

    componentWillUnmount() {
        if (this.renderer) {
            this.renderer.off('ready', this.processInfo, this);
            this.renderer.off('complete', this.setComplete, this);
        }
    }

    componentDidMount() {
        if (this.renderer) {
            this.renderer.start();
        }
    }

    onButtonClick() {
        if (this.renderer) {
            this.renderer.stop();
        }

        if (this.props.onButtonClick) {
            this.props.onButtonClick();
        }
    }

    processInfo() {
        let { frames, currentFrame, lastFrame, startTime } = this.renderer;

        this.setState({
            frames,
            currentFrame,
            lastFrame,
            startTime
        });
    }

    setComplete() {
        this.setState({ complete: true });
    }

    render() {
        let { frames, currentFrame, lastFrame, startTime, complete } = this.state,
            elapsedTime = (window.performance.now() - startTime) / 1000,
            frame = frames - (lastFrame - currentFrame),
            progress = frames > 0 ? (frame/frames) * 100 : 0,
            fps = elapsedTime > 0 ? frame / elapsedTime : 0,
            text = complete ? 'Finished' : 'Cancel';

        const style = { width: progress + '%' };

        return (
            <div className="render-info">
                <div className="render-progress">
                    <div className="render-progress-bar" style={style} />
                </div>
                <div className="render-stats">
                    <div className="info">
                        <span className="label">Progress</span>
                        {~~progress + '%'}
                    </div>
                    <div className="info">
                        <span className="label">Elapsed Time</span>
                        {formatTime(elapsedTime)}
                    </div>
                    <div className="info">
                        <span className="label">Frames</span>
                        {~~frame} / {~~frames}
                    </div>
                    <div className="info">
                        <span className="label">FPS</span>
                        {fps.toFixed(1)}
                    </div>
                    <Button text={text} onClick={this.onButtonClick} />
                </div>
            </div>
        );
    }
}

RenderInfo.contextTypes = {
    app: propTypes.object
};