import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';

export default class Stage extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            width: 854,
            height: 480,
            loading: false
        };
    }

    componentDidMount() {
        let canvas = Application.stage.renderer.domElement;

        canvas.className = 'canvas';

        this.refs.stage.appendChild(canvas);
    }

    onDragOver(e){
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop(e){
        e.stopPropagation();
        e.preventDefault();

        let file = e.dataTransfer.files[0];

        if (file) {
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
                <ReactCSSTransitionGroup
                    transitionName="loading"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}>
                    {loading}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

Stage.defaultProps = {
    onFileDropped: () => {}
};