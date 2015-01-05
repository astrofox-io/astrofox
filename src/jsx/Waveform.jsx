var Waveform = React.createClass({
    getInitialState: function() {
        return { progress: 0, seek: 0 };
    },

    componentWillMount: function() {
        this.config = {
            width: 854,
            height: 70,
            barWidth: 3,
            barSpacing: 1,
            shadowHeight: 30,
            bgColor: '#333333',
            bars: 213
        };
    },

    componentDidMount: function() {
        this.bars = new AstroFox.BarDisplay(
            this.refs.canvas.getDOMNode(),
            {
                y: this.config.height,
                height: this.config.height,
                width: this.config.width,
                barWidth: this.config.barWidth,
                barSpacing: this.config.barSpacing,
                color: ['#555555','#444444'],
                shadowHeight: this.config.shadowHeight,
                shadowColor: '#333333'
            }
        );

        this.progress = new AstroFox.BarDisplay(
            this.refs.progress.getDOMNode(),
            {
                y: this.config.height,
                height: this.config.height,
                width: this.config.width,
                barWidth: this.config.barWidth,
                barSpacing: this.config.barSpacing,
                color: ['#b6aaff','#927fff'],
                shadowHeight: this.config.shadowHeight,
                shadowColor: '#554b96'
            }
        );

        this.overlay = new AstroFox.BarDisplay(
            this.refs.overlay.getDOMNode(),
            {
                y: this.config.height,
                height: this.config.height,
                width: this.config.width,
                barWidth: this.config.barWidth,
                barSpacing: this.config.barSpacing,
                color: ['#8880bf','#6c5fbf'],
                shadowHeight: this.config.shadowHeight,
                shadowColor: '#403972'
            }
        );

        var player = this.props.player;

        player.on('load', function() {
            this.draw(player.waveform.getData(this.config.bars));
        }.bind(this));

        player.on('time', function(){
            this.forceUpdate();
        }.bind(this));

        player.on('stop', function(){
            this.forceUpdate();
        }.bind(this));
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = e.pageX - e.currentTarget.offsetLeft;

        this.props.player.seek('audio', val / this.config.width);
        this.props.onProgressChange(val);

        this.setState({ progress: val });
    },

    handleMouseMove: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = e.pageX - e.currentTarget.offsetLeft;
        this.setState({ seek: val });
    },

    handleMouseOut: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ seek: 0 });
    },

    getClipPath: function(height, width, start, end) {
        var points = [
            start + 'px 0px',
            end + 'px 0px',
            end + 'px ' + height + 'px',
            start + 'px ' + height + 'px',
            start + 'px 0px'
        ];

        return 'polygon(' + points.join(',') + ')';
    },

    draw: function(data) {
        this.bars.render(data);
        this.progress.render(data);
        this.overlay.render(data);
    },

    render: function() {
        var player = this.props.player,
            width = this.config.width,
            height = this.config.height + this.config.shadowHeight,
            seek = this.state.seek,
            progressWidth = player.getProgress('audio') * width,
            style = { width: progressWidth + 'px' },
            clipStyle = { display: 'none' };

        if (seek > 0) {
            var path = (seek > progressWidth) ?
                this.getClipPath(height, width, seek, progressWidth) :
                this.getClipPath(height, width, progressWidth, seek);

            clipStyle = { WebkitClipPath: path };
        }

        return (
            <div id="waveform">
                <div className="container"
                    onClick={this.handleClick}
                    onMouseMove={this.handleMouseMove}
                    onMouseOut={this.handleMouseOut}>
                    <div className="base">
                        <canvas ref="canvas" width="854" height="100"></canvas>
                    </div>
                    <div className="progress" style={style}>
                        <canvas ref="progress" width="854" height="100"></canvas>
                    </div>
                    <div className="overlay" style={clipStyle}>
                        <canvas ref="overlay" width="854" height="100"></canvas>
                    </div>
                </div>
            </div>
        );
    }
});