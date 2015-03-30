var Loading = React.createClass({
    getDefaultProps: function() {
        return { visible: false };
    },

    render: function() {
        var style = { display: this.props.visible ? 'block' : 'none' };

        return (
            <div id="loading" style={style}></div>
        );
    }
});