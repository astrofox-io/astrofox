var MainView = React.createClass({
    render: function(){
        return (
            <div id="view">
                {this.props.children}
            </div>
        );
    }
});