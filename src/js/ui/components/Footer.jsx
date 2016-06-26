'use strict';

const React = require('react');
const Application = require('../../core/Application.js');
const bytesToSize = require('../../util/bytesToSize.js');

class Footer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fps: 0
        };
    }

    componentDidMount() {
        Application.on('tick', function(stats) {
            this.setState({ fps: stats.fps });
        }, this);
    }

    render() {
        return (
            <div id="footer">
                <div className="filename flex">{this.props.filename}</div>
                <div className="fps">{bytesToSize(performance.memory.usedJSHeapSize,2)}</div>
                <div className="fps">{this.state.fps} FPS</div>
                <div className="version">v{process.versions.electron}</div>
            </div>
        );
    }
}

module.exports = Footer;