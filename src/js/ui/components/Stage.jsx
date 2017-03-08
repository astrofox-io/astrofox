import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Loading from './Loading';
import RenderInfo from './RenderInfo';

export default class Stage extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            renderVideo: false
        };
    }

    componentDidMount() {
        this.refs.canvas.appendChild(
            this.context.app.stage.renderer.domElement
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
            <div ref="stage"
                className={classNames(classes)}
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}>
                <Loading visible={this.state.loading} />
                <div ref="canvas" className="canvas">
                    {renderInfo}
                </div>
            </div>
        );
    }
}

Stage.contextTypes = {
    app: React.PropTypes.object
};