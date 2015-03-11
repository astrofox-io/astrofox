var ControlPanel = React.createClass({
    getControl: function(control, key) {
        var FX = this.props.app.FX,
            props = {
                app: this.props.app,
                control: control,
                key: key
            };

        if (control instanceof FX.BarDisplay) {
            return <SpectrumControl {...props} />;
        }
        else if (control instanceof FX.ImageDisplay) {
            return <ImageControl {...props} />;
        }
        else if (control instanceof FX.TextDisplay) {
            return <TextControl {...props} />;
        }
    },

    render: function() {
        var controls = this.props.app.controls.map(function(control) {
            return this.getControl(control, "control" + control.toString());
        }, this);

        return (
            <div id="controls">
                {controls}
            </div>
        );
    }
});