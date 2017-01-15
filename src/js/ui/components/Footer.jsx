'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { APP_VERSION } = require('../../core/Environment');
const { events } = require('../../core/Global');
const { formatSize } = require('../../util/format');

class Footer extends UIComponent {
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
        let memSize = null;

        if (process.env.NODE_ENV !== 'production') {
            memSize = formatSize(performance.memory.usedJSHeapSize, 2);
        }

        return (
            <div id="footer">
                <div className="left flex">{this.props.text}</div>
                <div className="right">{memSize}</div>
                <div className="right">{this.state.fps} FPS</div>
                <div className="right">v{process.versions.electron}</div>
                <div className="right">v{APP_VERSION}</div>
            </div>
        );
    }
}

module.exports = Footer;