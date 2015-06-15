'use strict';

var React = require('react');
var Application = require('../core/Application.js');
var Loading = require('./Loading.jsx');

var Stage = React.createClass({
    getDefaultProps: function() {
        return {
            onFileDropped: null
        }
    },

    getInitialState: function() {
        return {
            width: 854,
            height: 480,
            loading: false
        };
    },

    componentDidMount: function() {
        React.findDOMNode(this.refs.viewport).appendChild(
            Application.stage.renderer.domElement
        );

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
        var state = this.state,
            style = { width: state.width, height: state.height };

        return (
            <div className="scene"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <div ref="viewport" className="viewport" style={style}>
                    <Loading visible={state.loading} />
                </div>
            </div>
        );
    }
});

module.exports = Stage;