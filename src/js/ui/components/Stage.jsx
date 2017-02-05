import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';

import Loading from './Loading';
import RenderInfo from './RenderInfo';

export default class Stage extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            rendering: false
        };
    }

    componentDidMount() {
        this.refs.canvas.appendChild(
            Application.stage.renderer.domElement
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

    showLoading(val) {
        this.setState({ loading: val });
    }

    render() {
        const classes = {
            'stage': true,
            'stage-rendering': this.props.rendering
        };

        let renderInfo = (this.props.rendering) ? <RenderInfo/> : null;
        //let renderInfo = <RenderInfo />;

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

Stage.defaultProps = {
    rendering: false,
    onFileDropped: null
};