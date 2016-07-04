'use strict';

const React = require('react');
const Application = require('../../core/Application.js');
const Splitter = require('./Splitter.jsx');
const autoBind = require('../../util/autoBind.js');

class Panel extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            visible: props.visible || true,
            dragging: false,
            height: props.height,
            width: props.width,
            minHeight: props.minHeight || 0,
            minWidth: props.minWidth || 0,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0
        };
    }

    componentDidMount() {
        let props = this.props;

        Application.on('mouseup', () => {
            if (this.state.dragging) {
                this.setState({
                    dragging: false
                },
                () => {
                    if (props.onDragEnd) {
                        props.onDragEnd();
                    }
                });
            }
        });
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }

    onStartDrag(e) {
        let props = this.props,
            state = this.state;

        this.setState({
            dragging: true,
            startX: e.pageX,
            startY: e.pageY,
            startWidth: state.width,
            startHeight: state.height
        }, () => {
            if (props.onDragStart) {
                props.onDragStart(this);
            }
        });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove(e) {
        let val,
            state = this.state;

        if (state.dragging) {
            val = state.startHeight + e.pageY - state.startY;
            if (val < state.minHeight) {
                val = state.minHeight;
            }

            this.setState({ height: val });
        }

        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        let props = this.props,
            state = this.state,
            classes = 'panel',
            style = (state.height) ? { height: state.height } : null;

        classes += (props.direction == 'vertical') ? ' panel-vertical' : ' panel-horizontal';

        if (props.stretch) {
            classes += ' panel-stretch';
        }

        let splitter = (props.resizable) ?
            <Splitter type="horizontal" onDragStart={this.onStartDrag} /> : null;

        return (
            <div className={classes} style={style}>
                <div className="title">{this.props.title}</div>
                {this.props.children}
                {splitter}
            </div>
        );
    }
}

Panel.defaultProps = {
    shouldUpdate: true,
    direction: 'vertical',
    stretch: false
};

module.exports = Panel;