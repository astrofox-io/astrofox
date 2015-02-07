var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            controls: [
                <TextControl
                    onLoad={this.handleControlLoad}
                    {...this.props}
                />,
                <SpectrumControl
                    onLoad={this.handleControlLoad}
                    {...this.props}
                />,
                <ImageControl
                    onLoad={this.handleControlLoad}
                    {...this.props}
                />
            ],
            visible: true
        };
    },

    handleControlLoad: function(control) {
        this.props.onControlLoad(control);
    },

    render: function() {
        var style = { display: (this.state.visible) ? 'block' : 'none' };

        var controls = this.state.controls.map(function(control, index) {
            return <div key={"control" + index}>{control}</div>
        });

        return (
            <div id="dock" style={style}>
                <div className="title">CONTROLS</div>
                {controls}
            </div>
        );
    }
});