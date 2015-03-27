var MessageWindow = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.onConfirm();
    },

    render: function() {
        return (
            <div className="message-window">
                <div className="header">{this.props.title}</div>
                <div className="content">
                    {this.props.children}
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClick}>OK</div>
                </div>
            </div>
        );
    }
});