var ControlPanel = React.createClass({
    getControl: function(display, key) {
        var FX = this.props.app.FX,
            props = {
                key: key,
                app: this.props.app,
                display: display
            };

        if (display instanceof FX.BarDisplay) {
            return <SpectrumControl {...props} />;
        }
        else if (display instanceof FX.ImageDisplay) {
            return <ImageControl {...props} />;
        }
        else if (display instanceof FX.TextDisplay) {
            return <TextControl {...props} />;
        }
    },

    render: function() {
        var controls = this.props.app.displays.map(function(display) {
            return this.getControl(display, "control" + display.toString());
        }, this);

        return (
            <div id="controls">
                {controls}
            </div>
        );
    }
});