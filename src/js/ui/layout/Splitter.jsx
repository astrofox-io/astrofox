'use strict';

const React = require('react');

class Splitter extends React.Component {
    handleMouseDown(e) {
        if (this.props.onDragStart) {
            this.props.onDragStart(e);
        }
    }

    render() {
        var classes = 'splitter splitter-' + this.props.type;

        return (
            <div
                className={classes}
                onMouseDown={this.handleMouseDown.bind(this)}>
                <i className="icon-dots-three-horizontal" />
            </div>
        );
    }
}

Splitter.defaultProps = {
    type: 'horizontal'
};

module.exports = Splitter;