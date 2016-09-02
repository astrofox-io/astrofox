'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const { Events } = require('../../core/Global');

const Splitter = require('./Splitter.jsx');

class Panel extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible,
            dragging: false,
            height: props.height,
            width: props.width,
            minHeight: props.minHeight,
            minWidth: props.minWidth,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0
        };
    }

    componentDidMount() {
        Events.on('mouseup', this.checkDragState);
    }

    componentWillUnmount() {
        Events.off('mouseup', this.checkDragState);
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

    checkDragState() {
        if (this.state.dragging) {
            this.setState({ dragging: false }, this.props.onDragEnd);
        }
    }

    render() {
        let props = this.props,
            state = this.state,
            style = (state.height) ? { height: state.height } : null,
            classes = classNames({
                'panel': true,
                'panel-vertical': (props.direction === 'vertical'),
                'panel-horizontal': (props.direction !== 'vertical'),
                'panel-stretch': props.stretch === true
            });

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
    stretch: false,
    visible: true,
    height: 100,
    width: 100,
    minHeight: 0,
    minWidth: 0,
    onDragStart: () => {},
    onDragEnd: () => {}
};

module.exports = Panel;