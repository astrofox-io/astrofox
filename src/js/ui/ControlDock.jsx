'use strict';

var React = require('react');
var Application = require('../Application.js');
var Panel = require('./Panel.jsx');
var ControlsPanel = require('./ControlsPanel.jsx');
var LayersPanel = require('./LayersPanel.jsx');

var ControlDock = React.createClass({
    getInitialState: function() {
        return {
            visible: true,
            dragging: false
        };
    },

    componentDidMount: function() {
        Application.on('project_loaded', function() {
            this.refs.layers.forceUpdate();
            this.refs.controls.forceUpdate();
        }.bind(this));

        Application.on('display_changed', function() {
            this.refs.layers.forceUpdate();
            this.refs.controls.forceUpdate();
        }.bind(this));
    },

    handleLayerSelected: function(index) {
        this.refs.controls.scrollToControl(index);
    },

    handleLayerChanged: function(callback) {
        this.refs.controls.forceUpdate(callback);
    },

    handleDragStart: function() {
        this.setState({ dragging: true });
    },

    handleDragEnd: function() {
        this.setState({ dragging: false });
    },

    handleMouseMove: function(e) {
        this.refs.panel.handleMouseMove(e);
    },

    showDock: function(visible) {
        this.setState({ visible: visible });
    },

    render: function() {
        var state = this.state,
            style = { display: (state.visible) ? 'flex' : 'none' },
            mouseMove = (state.dragging) ? this.handleMouseMove : null;

        if (state.dragging) {
            style.cursor = 'ns-resize';
        }

        return (
            <div
                className="control-dock"
                style={style}
                onMouseMove={mouseMove}>
                <Panel
                    title="LAYERS"
                    ref="panel"
                    height={200}
                    resizable={true}
                    onDragStart={this.handleDragStart}
                    onDragEnd={this.handleDragEnd}>

                    <LayersPanel
                        ref="layers"
                        onLayerSelected={this.handleLayerSelected}
                        onLayerChanged={this.handleLayerChanged}
                    />
                </Panel>
                <Panel
                    title="CONTROLS"
                    className="flex"
                    shouldUpdate={false}>

                    <ControlsPanel ref="controls" />
                </Panel>
            </div>
        );
    }
});

module.exports = ControlDock;