var Loading = React.createClass({
    componentWillReceiveProps: function(props) {
        this.props.loading = props.loading;
    },

    getStyle: function() {
        return { display: this.props.loading ? 'block' : 'none' };
    },

    render: function() {
        return (
            <div id="loading" style={this.getStyle()}></div>
        );
    }
});