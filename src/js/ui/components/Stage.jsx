'use strict';

const React = require('react');
const Application = require('../../core/Application.js');
const Loading = require('./Loading.jsx');
const autoBind = require('../../util/autoBind.js');

class Stage extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
        
        this.state = {
            width: 854,
            height: 480,
            loading: false
        };
    }

    componentDidMount() {
        this.refs.viewport.appendChild(
            Application.stage.renderer.domElement
        );
    }

    handleMouseDown(e) {
        e.preventDefault();
    }

    handleDragOver(e){
        e.stopPropagation();
        e.preventDefault();
    }

    handleDrop(e){
        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];

        if (file && this.props.onFileDropped) {
            this.props.onFileDropped(file.path);
        }
    }

    showLoading(val) {
        this.setState({ loading: val });
    }

    render() {
        var state = this.state,
            style = { width: state.width, height: state.height };

        var loading = (state.loading) ? <div className="loading" /> : null;

        return (
            <div className="stage"
                onMouseDown={this.handleMouseDown}
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <div ref="viewport" className="viewport" style={style}>
                    {loading}
                </div>
            </div>
        );
    }
}

module.exports = Stage;