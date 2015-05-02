'use strict';

var React = require('react');
var Application = require('../Application.js');
var Loading = require('./Loading.jsx');

var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentDidMount: function() {
        this.canvas = React.findDOMNode(this.refs.canvas);
        Application.loadCanvas(this.canvas);
        Application.startRender();
    },

    handleDragOver: function(e){
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];

        if (this.props.onFileDropped) {
            this.props.onFileDropped(file);
        }
    },

    showLoading: function(val) {
        this.setState({ loading: val });
    },

    render: function() {
        return (
            <div className="scene"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <Loading visible={this.state.loading} />
                <canvas ref="canvas" className="canvas" height="480" width="854"></canvas>
            </div>
        );
    }
});

module.exports = Scene;