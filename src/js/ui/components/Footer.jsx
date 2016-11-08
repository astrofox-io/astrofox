'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { Events } = require('../../core/Global');
const { formatSize } = require('../../util/format');

class Footer extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            fps: 0
        };
    }

    componentDidMount() {
        Events.on('tick', this.updateStats);
    }

    componentWillUnmount() {
        Events.off('tick', this.updateStats);
    }

    updateStats(stats) {
        this.setState({ fps: stats.fps });
    }

    render() {
        return (
            <div id="footer">
                <div className="left text">{this.props.text}</div>
                <div className="right">{formatSize(performance.memory.usedJSHeapSize,2)}</div>
                <div className="right">{this.state.fps} FPS</div>
                <div>v{process.versions.electron}</div>
            </div>
        );
    }
}

module.exports = Footer;