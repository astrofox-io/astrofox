'use strict';

const React = require('react');

const { Events } = require('../../core/Global.js');
const bytesToSize = require('../../util/bytesToSize.js');
const autoBind = require('../../util/autoBind.js');

class Footer extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

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
                <div className="flex">{this.props.text}</div>
                <div className="right">{bytesToSize(performance.memory.usedJSHeapSize,2)}</div>
                <div className="right">{this.state.fps} FPS</div>
                <div>v{process.versions.electron}</div>
            </div>
        );
    }
}

module.exports = Footer;