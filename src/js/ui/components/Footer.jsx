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

        if (process.env.NODE_ENV === 'development') {
            this.dev = true;
        }
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
        let memSize = (this.dev !== undefined) ?
            formatSize(performance.memory.usedJSHeapSize,2) : null;

        return (
            <div id="footer">
                <div className="left flex">{this.props.text}</div>
                <div className="right">{memSize}</div>
                <div className="right">{this.state.fps} FPS</div>
                <div className="right">v{process.versions.electron}</div>
            </div>
        )
    }
}

module.exports = Footer;