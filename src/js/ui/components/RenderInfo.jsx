import React from 'react';

import Application from '../../core/Application';
import UIComponent from '../UIComponent';
import Button from './Button';
import { formatTime } from '../../util/format';

export default class RenderInfo extends UIComponent {
    constructor(props) {
        super(props);
    }

    onClick() {

    }

    render() {
        let currentFrame = 11234,
            totalFrames = 95678,
            elapsedTime = 1116,
            progress = ~~(currentFrame/totalFrames*100),
            fps = 27.98;

        const style = { width: progress + '%' };

        return (
            <div className="render-info">
                <div className="render-progress">
                    <div className="render-progress-bar" style={style} />
                </div>
                <div className="render-stats">
                    <div className="info">
                        <span className="label">Progress</span>
                        {progress + '%'}
                    </div>
                    <div className="info">
                        <span className="label">Elapsed Time</span>
                        {formatTime(elapsedTime)}
                    </div>
                    <div className="info">
                        <span className="label">Frames</span>
                        {currentFrame} / {totalFrames}
                    </div>
                    <div className="info">
                        <span className="label">FPS</span>
                        {fps}
                    </div>
                    <Button text="Cancel" onClick={this.onClick} />
                </div>
            </div>
        );
    }
}