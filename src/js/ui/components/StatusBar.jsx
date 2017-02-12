import React from 'react';

import UIComponent from '../UIComponent';
import { APP_VERSION } from '../../core/Environment';
import { events } from '../../core/Global';
import { formatSize } from '../../util/format';

export default class StatusBar extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            fps: 0
        };
    }

    componentDidMount() {
        events.on('tick', this.updateStats);
    }

    componentWillUnmount() {
        events.off('tick', this.updateStats);
    }

    updateStats(stats) {
        this.setState({ fps: stats.fps });
    }

    render() {
        let memSize = null,
            electronVersion = null;

        if (!__PROD__) {
            memSize = formatSize(performance.memory.usedJSHeapSize, 2);
            electronVersion = process.versions.electron;
        }

        return (
            <div className="statusbar">
                <div className="area left">
                    <span>{this.props.text}</span>
                </div>
                <div className="area center">
                </div>
                <div className="area right">
                    <span>{memSize}</span>
                    <span>{this.state.fps} FPS</span>
                    <span>{electronVersion}</span>
                    <span>{APP_VERSION}</span>
                </div>
            </div>
        );
    }
}