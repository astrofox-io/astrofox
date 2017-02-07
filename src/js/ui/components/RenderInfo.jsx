import React from 'react';

import Application from '../../core/Application';
import UIComponent from '../UIComponent';
import Button from './Button';
import { formatTime } from '../../util/format';

export default class RenderInfo extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            complete: false,
            fps: 0,
            currentFrame: 0,
            frames: 0,
            startTime: 0,
            elapsedTime: 0
        };
    }

    onButtonClick() {
        if (this.renderer) {
            this.renderer.stop();
        }

        if (this.props.onButtonClick) {
            this.props.onButtonClick();
        }
    }

    componentWillMount() {
        if (!Application.renderer) return;

        this.renderer = Application.renderer;

        this.renderer.on('ready', this.processInfo, this);
        this.renderer.on('complete', this.setComplete, this);
    }

    componentWillUnmount() {
        if (this.renderer) {
            this.renderer.off('ready', this.processInfo, this);
            this.renderer.off('complete', this.setComplete, this);
        }
    }

    processInfo() {
        let { currentFrame, frames, startTime } = this.renderer;

        this.setState({
            currentFrame,
            frames,
            startTime
        });
    }

    setComplete() {
        this.setState({ complete: true });
    }

    render() {
        let { currentFrame, frames, startTime, complete } = this.state,
            elapsedTime = (window.performance.now() - startTime) / 1000,
            progress = frames > 0 ? (currentFrame/frames*100) : 0,
            fps = elapsedTime > 0 ? currentFrame / elapsedTime : 0,
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
                        {currentFrame} / {~~frames}
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