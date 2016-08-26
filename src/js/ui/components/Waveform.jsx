'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const CanvasAudio = require('../../canvas/CanvasAudio');

class Waveform extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            position: 0,
            seek: 0
        };
    }

    componentDidMount() {
        let player = Application.player;

        this.base = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#555555','#444444'],
                shadowColor: '#333333'
            }),
            this.refs.base
        );

        this.progress = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#B6AAFF','#927FFF'],
                shadowColor: '#554B96'
            }),
            this.refs.progress
        );

        this.seek = new CanvasAudio(
            Object.assign({}, this.props, {
                color: ['#8880BF','#6C5FBF'],
                shadowColor: '#403972'
            }),
            this.refs.seek
        );

        player.on('load', () => {
            let sound = Application.player.getSound('audio');

            if (sound) {
                this.draw(sound.buffer);
            }
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