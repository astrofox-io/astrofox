import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import UIComponent from '../UIComponent';
import RenderInfo from './RenderInfo';
import { events } from '../../core/Global';
import { FirstChild } from '../../util/react';

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
        this.app.stage.init(this.canvas);

        events.on('zoom', this.forceUpdate, this);
    }

    componentWillUnmount() {
        events.off('zoom', this.forceUpdate, this);
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

    render() {
        let loadingIcon, renderInfo,
            { loading, rendering } = this.state,
            { width, height, zoom } = this.app.stage.options,
            style = {
                width: (width * zoom) + 'px',
                height: (height * zoom) + 'px'
            };

        if (loading) {
            loadingIcon = <div className="loading"/>;
        }

        if (rendering) {
            renderInfo = <RenderInfo onButtonClick={this.stopRender} />;
        }

        return (
            <div className="stage">
                <div className="scroll">
                    <div
                        className="canvas"
                        onDrop={this.onDrop}
                        onDragOver={this.onDragOver}>
                        <canvas ref={el => this.canvas = el} style={style} />
                        <CSSTransitionGroup
                            component={FirstChild}
                            transitionName="stage"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
                            {loadingIcon}
                        </CSSTransitionGroup>
                        <CSSTransitionGroup
                            component={FirstChild}
                            transitionName="stage"
                            transitionEnterTimeout={500}
                            transitionLeaveTimeout={500}>
                            {renderInfo}
                        </CSSTransitionGroup>
                    </div>
                </div>
            </div>
        );
    }
}

Stage.contextTypes = {
    app: React.PropTypes.object
};