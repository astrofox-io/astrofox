var Panel = React.createClass({
    getDefaultProps: function() {
        return { shouldUpdate: true };
    },

    shouldComponentUpdate: function(nextProps) {
        return nextProps.shouldUpdate;
    },

    render: function() {
        var props = this.props,
            classes = 'panel ' + (props.className || ''),
            style = (props.height) ? { height: props.height + 'px' } : null;

        return (
            <div className={classes} style={style}>
                <div className="title">{this.props.title}</div>
                {this.props.children}
            </div>
        );
    }
});