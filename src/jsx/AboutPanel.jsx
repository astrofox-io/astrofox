var AboutPanel = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.props.onOkClick();
    },

    render: function() {
        return (
            <div className="about">
                <div className="header">ABOUT</div>
                <div className="content">
                    AstroFox version 1.0
                </div>
                <div className="buttons">
                    <div className="button" onClick={this.handleClick}>OK</div>
                </div>
            </div>
        );
    }
});