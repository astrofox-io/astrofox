import React from 'react';
import propTypes from 'prop-types';

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
        events.on('tick', this.updateStats, this);
    }

    componentWillUnmount() {
        events.off('tick', this.updateStats, this);
    }

    updateStats(stats) {
        this.setState({ fps: stats.fps });
    }

    render() {
        let memSize, electronVersion;

        if (process.env.NODE_ENV !== 'production') {
            memSize = formatSize(window.performance.memory.usedJSHeapSize, 2);
            electronVersion = process.versions.electron;
        }

        return (
            <div className="statusbar">
                <div className="area left">
                    <span className="item">{this.props.text}</span>
                </div>
                <div className="area center">
                    <Zoom />
                </div>
                <div className="area right">
                    <span className="item">{memSize}</span>
                    <span className="item">{electronVersion}</span>
                    <span className="item">{this.state.fps} FPS</span>
                    <span className="item">{APP_VERSION}</span>
                </div>
            </div>
        );
    }
}

class Zoom extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
    }

    componentDidMount() {
        events.on('zoom', this.forceUpdate, this);
    }

    componentWillUnmount() {
        events.off('zoom', this.forceUpdate, this);
    }

    setZoom(val) {
        this.app.stage.setZoom(val);
        this.forceUpdate();
    }

    render() {
        let { width, height, zoom } = this.app.stage.options;

        return (
            <div className="zoom">
                <span className="item">{width} x {height}</span>
                <span className="zoom-button" onClick={() => this.setZoom(-1)}>-</span>
                <span className="zoom-value">{zoom * 100}%</span>
                <span className="zoom-button" onClick={() => this.setZoom(1)}>+</span>
            </div>
        );
    }
}

Zoom.contextTypes = {
    app: propTypes.object
};