var ModalWindow = React.createClass({
    getDefaultProps: function() {
        return {
            visible: false,
            width: 400,
            height: 300
        }
    },

    render: function() {
        var classes = 'modal';

        if (this.props.visible) {
            classes += ' modal-active';
        }

        var windowStyle = {
            width: this.props.width + 'px',
            height: this.props.height + 'px'
        };

        return (
            <div className={classes}>
                <div className="overlay" />
                <div className="window" style={windowStyle}>
                    {this.props.children}
                </div>
            </div>
        );
    }
});