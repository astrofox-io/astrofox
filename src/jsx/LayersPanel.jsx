var LayersPanel = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: 0
        };
    },

    handleLayerClick: function(index) {
        this.setState({ activeIndex: index }, function() {
            this.props.onLayerSelected(index);
        }.bind(this));
    },

    handleAddClick: function() {

    },

    handleRemoveClick: function() {
        var app = this.props.app,
            index = this.state.activeIndex,
            display = app.displays[index];

        if (index === app.displays.length - 1) {
            this.setState({ activeIndex: index - 1 });
        }

        app.removeDisplay(display);
        this.forceUpdate();
        this.props.onLayerChanged();
    },

    handleMoveUpClick: function() {
        var index = this.state.activeIndex;

        if (index <= 0) return;
    },

    handleMoveDownClick: function() {
        var len = this.props.app.displays.length - 1,
            index = this.state.activeIndex;

        if (index == len) return;
    },

    render: function() {
        var layers;

        layers = this.props.app.displays.map(function(display, index) {
            var classes = 'layer';
            if (index === this.state.activeIndex) {
                classes += ' layer-active';
            }

            return (
                <div key={'layer' + display.toString()}
                    className={classes}
                    onClick={this.handleLayerClick.bind(this, index)}>
                    {display.toString()}
                </div>
            );
        }, this);

        return (
            <div id="layers">
                <div className="layers">
                    {layers}
                </div>
                <ul className="commands">
                    <li className="button icon-plus" onClick={this.handleAddClick} />
                    <li className="button icon-minus" onClick={this.handleRemoveClick} />
                    <li className="button icon-up-open" onClick={this.handleMoveUpClick} />
                    <li className="button icon-down-open" onClick={this.handleMoveDownClick} />
                </ul>
            </div>
        );
    }
});