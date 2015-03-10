var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true,
            panelHeight: 200
        };
    },

    componentWillMount: function() {
        this.lastY = 0;
        this.splitterActive = false;
        this.minPanelHeight = 100;
    },

    componentDidMount: function() {
        this.props.app.on('mouseup', function() {
            this.splitterActive = false;
        }.bind(this));
    },

    handleMouseMove: function(e) {
        if (this.splitterActive) {
            var val = this.state.panelHeight + e.screenY - this.lastY;
            if (val < this.minPanelHeight) {
                val = this.minPanelHeight;
            }

            this.lastY  = e.screenY;
            this.setState({ panelHeight: val });
        }
    },

    handleStartDrag: function(e) {
        this.splitterActive = true;
        this.lastY = e.screenY;
    },

    render: function() {
        var style = { display: (this.state.visible) ? 'flex' : 'none' };

        return (
            <div id="dock" style={style} onMouseMove={this.handleMouseMove}>
                <div className="title">LAYERS</div>
                <LayersPanel {...this.props} height={this.state.panelHeight} />

                <Splitter type="horizontal" onStartDrag={this.handleStartDrag} />

                <div className="title">CONTROLS</div>
                <ControlPanel {...this.props} />
            </div>
        );
    }
});