var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true,
            dragging: false,
            panelHeight: 200,
            startY: 0,
            startHeight: 200
        };
    },

    componentWillMount: function() {
        this.minPanelHeight = 100;
    },

    componentDidMount: function() {
        this.dock = this.refs.dock.getDOMNode();

        this.props.app.on('mouseup', function() {
            this.setState({ dragging: false });
        }.bind(this));
    },

    handleMouseMove: function(e) {
        var val,
            state = this.state;

        if (state.dragging) {
            val = state.startHeight + e.pageY - state.startY;
            if (val < this.minPanelHeight) {
                val = this.minPanelHeight;
            }

            this.setState({ panelHeight: val });
        }
    },

    handleStartDrag: function(e) {
        this.setState({
            dragging: true,
            startY: e.pageY,
            startHeight: this.state.panelHeight
        });
    },

    render: function() {
        var state = this.state,
            style = { display: (state.visible) ? 'flex' : 'none' },
            mouseMove = (state.dragging) ? this.handleMouseMove : null;

        if (state.dragging) {
            style.cursor = 'ns-resize';
        }

        return (
            <div
                id="dock"
                ref="dock"
                style={style}
                onMouseMove={mouseMove}>
                <div className="title">LAYERS</div>
                <LayersPanel {...this.props} height={state.panelHeight} />

                <Splitter type="horizontal" onStartDrag={this.handleStartDrag} />

                <div className="title">CONTROLS</div>
                <ControlPanel {...this.props} />
            </div>
        );
    }
});