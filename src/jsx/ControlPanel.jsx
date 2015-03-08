var ControlPanel = React.createClass({
    getControl: function(control) {
        var FX = this.props.app.FX,
            props = {
                app: this.props.app,
                control: control
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
        var controls = this.props.controls.map(function(control) {
            return (
                <div key={"control" + control.toString()}>
                    {this.getControl(control)}
                </div>
            );
        }, this);

        return (
            <div>
                {controls}
            </div>
        );
    }
});