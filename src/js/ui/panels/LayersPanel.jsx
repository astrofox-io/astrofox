'use strict';

var React = require('react');
var Application = require('../../Application.js');
var TextInput = require('../input/TextInput.jsx');

var LayersPanel = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: 0,
            editIndex: -1
        };
    },

    handleLayerClick: function(index) {
        var state = this.state,
            editIndex = (index == state.editIndex) ? state.editIndex: -1;

        this.setState({ activeIndex: index, editIndex: editIndex }, function() {
            this.props.onLayerSelected(index);
        }.bind(this));
    },

    handleDoubleClick: function(index) {
        this.setState({ editIndex: index });
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
        var len = Application.displays.length - 1,
            index = this.state.activeIndex,
            newIndex = index + 1;

        if (index !== len) {
            Application.swapDisplay(index, newIndex);
            this.setState({ activeIndex: newIndex });

            this.props.onLayerChanged(function() {
                this.props.onLayerSelected(newIndex);
            }.bind(this));
        }
    },

    handleLayerEdit: function(val, index) {
        var display = Application.displays[index];

        display.init({ displayName: val });

        this.cancelEdit();
    },

    cancelEdit: function() {
        this.setState({ editIndex: -1 });
    },

    render: function() {
        var layers;

        layers = Application.displays.map(function(display, index) {
            var classes = 'layer';
            if (index === this.state.activeIndex) {
                classes += ' layer-active';
            }

            var handleChange = function(name, val) {
                this.handleLayerEdit(val, index);
            }.bind(this);

            var displayName = (this.state.editIndex == index) ?
                <TextInput
                    value={display.options.displayName}
                    buffered={true}
                    autoFocus={true}
                    autoSelect={true}
                    onChange={handleChange}
                    onCancel={this.cancelEdit} /> :
                display.options.displayName;

            return (
                <div key={display.toString()}
                    className={classes}
                    onClick={this.handleLayerClick.bind(this, index)}
                    onDoubleClick={this.handleDoubleClick.bind(this, index)}>
                    {displayName}
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