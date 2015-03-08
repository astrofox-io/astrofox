var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true
        };
    },

    render: function() {
        var style = { display: (this.state.visible) ? 'block' : 'none' };

        return (
            <div id="dock" style={style}>
                <div className="title">LAYERS</div>
                <LayersPanel {...this.props} />

                <div className="title">CONTROLS</div>
                <ControlPanel {...this.props} />
            </div>
        );
    }
});