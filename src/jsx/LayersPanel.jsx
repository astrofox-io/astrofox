var LayersPanel = React.createClass({
    render: function() {
        var layers = this.props.controls.map(function(control) {
            return <div key={"layer" + control.toString()}>{control.toString()}</div>
        });

        return (
            <div id="layers">
                {layers}
            </div>
        );
    }
});