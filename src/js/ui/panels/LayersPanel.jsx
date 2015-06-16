'use strict';

var React = require('react');
var Application = require('core/Application.js');
var Display = require('display/Display.js');
var Stage = require('display/Stage.js');
var Scene = require('display/Scene.js');
var TextInput = require('ui/input/TextInput.jsx');

var LayersPanel = React.createClass({
    getDefaultProps: function() {
        return {
            onLayerSelected: null,
            onLayerChanged: null
        }
    },

    getInitialState: function() {
        return {
            activeIndex: 0,
            editIndex: -1,
            layers: []
        };
    },

    componentWillMount: function() {
        this.updateLayers();
    },

    handleLayerClick: function(index) {
        var state = this.state,
            props = this.props,
            editIndex = (index == state.editIndex) ? state.editIndex: -1;

        if (index !== state.activeIndex) {
            this.setState({activeIndex: index, editIndex: editIndex}, function(){
                if (props.onLayerSelected) {
                    props.onLayerSelected(this.getActiveLayer());
                }
            }.bind(this));
        }
    },

    handleDoubleClick: function(index) {
        if (index !== this.state.editIndex) {
            this.setState({editIndex: index});
        }
    },

    handleAddScene: function() {
        var scene = new Scene();

        Application.stage.addScene(scene);

        this.updateLayers(function() {
            this.setActiveLayer(scene);
        }.bind(this));
    },

    handleAddClick: function() {
        var state = this.state,
            layer = state.layers[state.activeIndex],
            scene = (layer instanceof Display) ? layer.parent : layer;

        if (Application.stage.hasScenes()) {
            Application.emit('pick_control', scene);
        }
    },

    handleRemoveClick: function() {
        var state = this.state,
            props = this.props,
            index = this.state.activeIndex,
            layers = state.layers,
            layer = layers[index],
            last = layers.length - 1;

        if (Application.stage.hasScenes() && layer) {
            if (layer instanceof Display) {
                layer.parent.removeDisplay(layer);
            }
            else if (layer instanceof Scene) {
                layer.parent.removeScene(layer);
            }

            this.updateLayers(function(){
                if (index === last) {
                    this.setState({activeIndex: last - 1});
                }
            });

            if (props.onLayerChanged) {
                props.onLayerChanged();
            }
        }
    },

    handleMoveUpClick: function() {
        this.moveLayer(1);
    },

    handleMoveDownClick: function() {
        this.moveLayer(-1);
    },

    handleLayerEdit: function(val) {
        var layer = this.getActiveLayer();

        layer.displayName = val;

        this.cancelEdit();
    },

    cancelEdit: function() {
        this.setState({ editIndex: -1 });
    },

    getActiveLayer: function() {
        var state = this.state;

        return state.layers[state.activeIndex];
    },

    setActiveLayer: function(i) {
        var props = this.props,
            index = (typeof i === 'number') ? i : this.state.layers.indexOf(i);

        this.setState({ activeIndex: index }, function(){
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        });
    },

    getLayerComponent: function(obj, index) {
        var text, icon,
            state = this.state,
            classes = 'layer';

        if (obj instanceof Display) {
            classes += ' layer-control';
        }

        if (index === this.state.editIndex) {
            classes += ' layer-edit';
        }
        else if (index === this.state.activeIndex) {
            classes += ' layer-active';
        }

        if (state.editIndex === index) {
            var handleChange = function(name, val) {
                if (val.length > 0) {
                    this.handleLayerEdit(val, index);
                }
            }.bind(this);

            text = (
                <TextInput
                    value={obj.displayName}
                    buffered={true}
                    autoFocus={true}
                    autoSelect={true}
                    onChange={handleChange}
                    onCancel={this.cancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.handleDoubleClick.bind(this, index)}>
                    {obj.displayName}
                </span>
            );
        }

        if (obj instanceof Display) {
            icon = <i className="layer-icon icon-cube" />;
        }
        else if (obj instanceof Scene) {
            icon = <i className="layer-icon icon-picture" />;
        }

        return (
            <div key={obj.toString()}
                 className={classes}
                 onClick={this.handleLayerClick.bind(this, index)}>
                {icon} {text}
            </div>
        );
    },

    updateLayers: function(callback) {
        var layers = [];

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            layers.push(scene);

            scene.displays.nodes.reverse().forEach(function(display) {
                layers.push(display);
            }, this);
        }, this);

        this.setState({ layers: layers }, callback);
    },

    moveLayer: function(direction) {
        var index,
            props = this.props,
            layer = this.getActiveLayer();

        if (layer instanceof Display) {
            layer.parent.moveDisplay(layer, direction);
        }
        else if (layer instanceof Scene) {
            layer.parent.moveScene(layer, direction);
        }

        this.updateLayers(function(){
            index = this.state.layers.indexOf(layer);
            this.setState({ activeIndex: index });

            props.onLayerChanged(function() {
                props.onLayerSelected(this.getActiveLayer());
            }.bind(this));
        }.bind(this));
    },

    render: function() {
        var layers,
            hasScenes = Application.stage.hasScenes(),
            addClasses = 'btn icon-cube',
            fxClasses = 'btn icon-light-up',
            removeClasses = 'btn icon-trash-empty',
            moveUpClasses = 'btn icon-up-open',
            moveDownClasses = 'btn icon-down-open';

        if (!hasScenes) {
            addClasses += ' btn-disabled';
            fxClasses += ' btn-disabled';
            removeClasses += ' btn-disabled';
            moveUpClasses += ' btn-disabled';
            moveDownClasses += ' btn-disabled';
        }

        layers = this.state.layers.map(function(layer, index) {
            return this.getLayerComponent(layer, index);
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="btn-group">
                    <li className="btn icon-picture" title="Add Scene" onClick={this.handleAddScene} />
                    <li className={addClasses} title="Add Display" onClick={this.handleAddClick} />
                    <li className={fxClasses} title="Add Effect" onClick={this.handleAddClick} />
                    <li className={moveUpClasses} title="Move Layer Up" onClick={this.handleMoveUpClick} />
                    <li className={moveDownClasses} title="Move Layer Down" onClick={this.handleMoveDownClick} />
                    <li className={removeClasses} title="Delete Layer" onClick={this.handleRemoveClick} />
                </ul>
            </div>
        );
    }
});

module.exports = LayersPanel;