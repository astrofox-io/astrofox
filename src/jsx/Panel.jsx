var Panel = React.createClass({
    render: function() {
        var classes = 'panel ' + this.props.className,
            style = (this.props.height) ? { height: this.props.height + 'px' } : {};

        return (
            <div className={classes} style={style}>
                <div className="title">{this.props.title}</div>
                {this.props.children}
            </div>
        );
    }
});