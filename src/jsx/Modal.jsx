var Modal = React.createClass({
    getDefaultProps: function() {
        return {
            visible: false
        }
    },

    render: function() {
        var classes = 'modal';

        if (this.props.visible) {
            classes += ' modal-active';
        }

        return (
            <div className={classes}>
                <div className="overlay" />
                <div className="window">
                    {this.props.children}
                </div>
            </div>
        );
    }
});