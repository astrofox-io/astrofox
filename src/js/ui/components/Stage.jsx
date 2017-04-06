import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import UIComponent from '../UIComponent';
import RenderInfo from './RenderInfo';
import { events } from '../../core/Global';

export default class Stage extends UIComponent {
    constructor(props, context) {
        super(props);
        
        this.state = {
            loading: false,
            rendering: false
        };

        this.app = context.app;
        this.canvas = null;
    }

    componentDidMount() {
        this.canvas.appendChild(
            this.app.stage.renderer.domElement
        );

        events.on('stage-resize', this.setSize, this);
    }

    componentWillUnmount() {
        events.off('stage-resize', this.setSize, this);
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

    startRender() {
        this.setState({ rendering: true });
    }

    stopRender() {
        this.setState({ rendering: false });
    }

    showLoading(val) {
        this.setState({ loading: val });
    }

    setSize(width, height) {
        let canvas = this.app.stage.renderer.domElement;

        if (canvas) {
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
    }

    render() {
        let loading = null,
            renderInfo = null;

        if (this.state.loading) {
            loading = <div className="loading"/>;
        }

        if (this.state.rendering) {
            renderInfo = <RenderInfo onButtonClick={this.stopRender} />;
        }

        return (
            <div className="stage">
                <div
                    ref={el => this.canvas = el}
                    className="canvas"
                    onDrop={this.onDrop}
                    onDragOver={this.onDragOver}>
                    <CSSTransitionGroup
                        transitionName="stage"
                        transitionEnterTimeout={500}
                        transitionLeaveTimeout={500}>
                        {loading}
                        {renderInfo}
                    </CSSTransitionGroup>
                </div>
            </div>
        );
    }
}

Stage.contextTypes = {
    app: React.PropTypes.object
};