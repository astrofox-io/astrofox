'use strict';

var React = require('react');
var Application = require('../Application.js');

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
        Application.emit('pick_control');
    },

    handleRemoveClick: function() {
        var index = this.state.activeIndex,
            display = Application.displays[index];

        if (index === Application.displays.length - 1) {
            this.setState({ activeIndex: index - 1 });
        }

        Application.removeDisplay(display);
        this.forceUpdate();
        this.props.onLayerChanged();
    },

    handleMoveUpClick: function() {
        var index = this.state.activeIndex,
            newIndex = index - 1;

        if (index > 0) {
            Application.swapDisplay(index, newIndex);
            this.setState({ activeIndex: newIndex });

            this.props.onLayerChanged(function() {
                this.props.onLayerSelected(newIndex);
            }.bind(this));
        }
    },

    handleMoveDownClick: function() {
        var app = Application,
            len = Application.displays.length - 1,
            index = this.state.activeIndex,
            newIndex = index + 1;

        if (index !== len) {
            app.swapDisplay(index, newIndex);
            this.setState({ activeIndex: newIndex });
            this.props.onLayerChanged(function() {
                this.props.onLayerSelected(newIndex);
            }.bind(this));
        }
    },

    render: function() {
        var layers;

        layers = Application.displays.map(function(display, index) {
            var classes = 'layer';
            if (index === this.state.activeIndex) {
                classes += ' layer-active';
            }

            return (
                <div key={display.toString()}
                    className={classes}
                    onClick={this.handleLayerClick.bind(this, index)}>
                    {display.toString()}
                </div>
            );
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="btn-group">
                    <li className="btn icon-plus" onClick={this.handleAddClick} />
                    <li className="btn icon-minus" onClick={this.handleRemoveClick} />
                    <li className="btn icon-up-open" onClick={this.handleMoveUpClick} />
                    <li className="btn icon-down-open" onClick={this.handleMoveDownClick} />
                </ul>
            </div>
        );
    }
});

module.exports = LayersPanel;