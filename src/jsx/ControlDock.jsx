var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true
        };
    },

    render: function() {
        var style = { display: (this.state.visible) ? 'flex' : 'none' };

        return (
            <div id="dock" style={style}>
                <LayersPanel {...this.props} />
                <ControlPanel {...this.props} />
            </div>
        );
    }
});