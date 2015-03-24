var ControlsPanel = React.createClass({
    getControl: function(display, index) {
        var FX = this.props.app.FX,
            ref = 'ctrl' + index,
            props = {
                app: this.props.app,
                display: display,
                key: 'ctrl' + display.toString()
            };

        if (display instanceof FX.BarDisplay) {
            return <SpectrumControl ref={ref} {...props} />;
        }
        else if (display instanceof FX.ImageDisplay) {
            return <ImageControl ref={ref} {...props} />;
        }
        else if (display instanceof FX.TextDisplay) {
            return <TextControl ref={ref} {...props} />;
        }
    },

    scrollToControl: function(index) {
        var node = React.findDOMNode(this.refs['ctrl' + index]);
        document.getElementById('controls').scrollTop = node.offsetTop;
    },

    render: function() {
        var controls = this.props.app.displays.map(function(display, index) {
            return this.getControl(display, index);
        }, this);

        return (
            <div id="controls">
                {controls}
            </div>
        );
    }
});