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
        this.refs.stage.appendChild(
            Application.stage.renderer.domElement
        );
    }

    onDragOver(e){
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop(e){
        e.stopPropagation();
        e.preventDefault();

        let file = e.dataTransfer.files[0];

        if (file && this.props.onFileDropped) {
            this.props.onFileDropped(file.path);
        }
    }

    showLoading(val) {
        this.setState({ loading: val });
    }

    render() {
        const loading = (this.state.loading) ? <div className="loading" /> : null;

        return (
            <div ref="stage"
                className="stage"
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}>
                {loading}
            </div>
        );
    }
}

module.exports = Stage;