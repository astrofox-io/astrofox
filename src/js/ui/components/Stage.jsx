import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Loading from './Loading';
import RenderInfo from './RenderInfo';

export default class Stage extends UIComponent {
    constructor(props, context) {
        super(props);
        
        this.state = {
            loading: false,
            renderVideo: false
        };

        this.app = context.app;
        this.canvas = null;
    }

    componentDidMount() {
        this.canvas.appendChild(
            this.app.stage.renderer.domElement
        );
    }

    onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        const file = e.dataTransfer.files[0];

        if (file && this.props.onFileDropped) {
            this.props.onFileDropped(file.path);
        }
    }

    stopRender() {
        if (this.props.onStopRender) {
            this.props.onStopRender();
        }
    }

    showLoading(val) {
        this.setState({ loading: val });
    }

    render() {
        const classes = {
            'stage': true,
            'stage-video-render': this.props.renderVideo
        };

        let renderInfo = (this.props.renderVideo) ?
            <RenderInfo onButtonClick={this.stopRender} /> :
            null;

        return (
            <div
                className={classNames(classes)}
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}>
                <Loading visible={this.state.loading} />
                <div ref={el => this.canvas = el} className="canvas">
                    {renderInfo}
                </div>
            </div>
        );
    }
}

Stage.contextTypes = {
    app: React.PropTypes.object
};