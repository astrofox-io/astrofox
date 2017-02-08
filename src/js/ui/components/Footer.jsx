import React from 'react';

import UIComponent from '../UIComponent';
import { APP_VERSION } from '../../core/Environment';
import { events } from '../../core/Global';
import { formatSize } from '../../util/format';

export default class Footer extends UIComponent {
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
            <div id="footer">
                <div className="left flex">{this.props.text}</div>
                <div className="right">{memSize}</div>
                <div className="right">{this.state.fps} FPS</div>
                <div className="right">{electronVersion}</div>
                <div className="right">{APP_VERSION}</div>
            </div>
        );
    }
}