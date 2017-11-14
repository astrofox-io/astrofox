import React from 'react';
import propTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import RenderInfo from 'components/stage/RenderInfo';
import { events } from 'core/Global';
import { FirstChild } from 'util/react';

export default class Stage extends React.Component {
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

    onDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    onDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const file = e.dataTransfer.files[0],
            { onFileDropped } = this.props;

        if (file && onFileDropped) {
            onFileDropped(file.path);
        }
    };

    startRender = () => {
        this.setState({ rendering: true });
    };

    stopRender = () => {
        this.setState({ rendering: false });
    };

    showLoading = (value) => {
        this.setState({ loading: value });
    };

    render() {
        let { loading, rendering } = this.state,
            { width, height, zoom } = this.app.stage.options,
            style = {
                width: (width * zoom) + 'px',
                height: (height * zoom) + 'px'
            };

        return (
            <div className="stage">
                <div className="scroll">
                    <div
                        className="canvas"
                        onDrop={this.onDrop}
                        onDragOver={this.onDragOver}>
                        <canvas ref={e => this.canvas = e} style={style} />
                        <Loading visible={loading} />
                        <Rendering visible={rendering} onButtonClick={this.stopRender} />
                    </div>
                </div>
            </div>
        );
    }
}

const Loading = (props) => {
    let loadingIcon;

    if (props.visible) {
        loadingIcon = (
            <CSSTransition
                classNames="stage"
                timeout={{enter:500, exit: 500}}>
                <div className="loading"/>
            </CSSTransition>
        );
    }

    return (
        <TransitionGroup component={FirstChild}>
            {loadingIcon}
        </TransitionGroup>
    );
};

const Rendering = (props) => {
    let renderInfo;

    if (props.visible) {
        renderInfo = (
            <CSSTransition
                classNames="stage"
                timeout={{enter:500, exit: 500}}>
                <RenderInfo onButtonClick={props.onButtonClick} />
            </CSSTransition>
        );
    }

    return (
        <TransitionGroup component={FirstChild}>
            {renderInfo}
        </TransitionGroup>
    );
};

Stage.contextTypes = {
    app: propTypes.object
};