'use strict';

const React = require('react');
const Application = require('../../core/Application.js');
const BarDisplay = require('../../display/BarDisplay.js');
const WaveformParser = require('../../audio/WaveformParser.js');
const autoBind = require('../../util/autoBind.js');

class Waveform extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            position: 0,
            seek: 0
        };
    }

    componentDidMount() {
        let player = Application.player;

        this.base = new BarDisplay(
            this.refs.base,
            Object.assign({}, this.props, {
                color: ['#555555','#444444'],
                shadowColor: '#333333'
            })
        );

        this.progress = new BarDisplay(
            this.refs.progress,
            Object.assign({}, this.props, {
                color: ['#b6aaff','#927fff'],
                shadowColor: '#554b96'
            })
        );

        this.seek = new BarDisplay(
            this.refs.seek,
            Object.assign({}, this.props, {
                color: ['#8880bf','#6c5fbf'],
                shadowColor: '#403972'
            })
        );

        player.on('load', () => {
            let options = { bars: this.props.bars },
                buffer = Application.player.getSound('audio').buffer,
                data = WaveformParser.parseBuffer(buffer, options);

            this.draw(data);
        }, this);

        player.on('tick', () => {
            this.setState({ position: Application.player.getPosition('audio') })
        }, this);

        player.on('stop', () => {
            this.setState({ position: 0 });
        }, this);

        player.on('seek', () => {
            let val  = Application.player.getPosition('audio');
            this.setState({ position: val, seek: val })
        }, this);
    }

    onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        let val = e.pageX - e.currentTarget.offsetLeft,
            player = Application.player;

        player.seek('audio', val / this.props.width);

        this.setState({ progress: val });
    }

    onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();

        if (Application.player.getSound('audio')) {
            let val = e.pageX - e.currentTarget.offsetLeft;
            this.setState({seek: val});
        }
    }

    onMouseOut(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ seek: 0 });
    }

    getClipPath(start, end) {
        return 'inset(0 ' + end + 'px 0 ' + start + 'px)';
    }

    draw(data) {
        this.base.render(data);
        this.progress.render(data);
        this.seek.render(data);
    }

    render() {
        let width = this.props.width,
            height = this.props.height + this.props.shadowHeight,
            seek = this.state.seek,
            progressWidth = this.state.position * width,
            progressStyle = { width: progressWidth + 'px' },
            seekStyle = { display: 'none' };

        if (seek > 0) {
            let path = (seek < progressWidth) ?
                this.getClipPath(seek, width - progressWidth) :
                this.getClipPath(progressWidth, width - seek);

            seekStyle = { WebkitClipPath: path };
        }

        return (
            <div className="waveform">
                <div className="container"
                    onClick={this.onClick}
                    onMouseMove={this.onMouseMove}
                    onMouseOut={this.onMouseOut}>
                    <div className="canvas base">
                        <canvas ref="base" width={width} height={height} />
                    </div>
                    <div className="canvas progress" style={progressStyle}>
                        <canvas ref="progress" width={width} height={height} />
                    </div>
                    <div className="canvas seek" style={seekStyle}>
                        <canvas ref="seek" width={width} height={height} />
                    </div>
                </div>
            </div>
        );
    }
}

Waveform.defaultProps = {
    width: 854,
    height: 70,
    barWidth: 3,
    barSpacing: 1,
    shadowHeight: 30,
    bgColor: '#333333',
    bars: 213
};

module.exports = Waveform;