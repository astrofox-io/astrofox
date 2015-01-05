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
            ]
        };
    },

    handleControlLoad: function(control) {
        this.props.onControlLoad(control);
    },

    render: function() {
        var i = 0;
        var controls = this.state.controls.map(function(result) {
            return <div key={"control" + i++}>{result}</div>
        });

        return (
            <div id="dock">
                <div className="title">CONTROLS</div>
                {controls}
            </div>
        );
    }
});