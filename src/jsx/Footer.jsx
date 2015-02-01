var Footer = React.createClass({
    render: function() {
        return (
            <div id="footer">
                <div className="filename">{this.props.filename}</div>
                <div className="fps">{this.props.fps}</div>
                <div className="version">v1.0</div>
            </div>
        );
    }
});