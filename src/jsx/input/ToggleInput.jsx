var ToggleInput = React.createClass({
    getInitialState: function() {
        return { value: 0 };
    },

    getDefaultProps: function() {
        return {
            name: "toggle"
        };
    },

    componentDidMount: function() {
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = (this.state.value + 1) % 2;

        this.setState({ value: val }, function(){
            this.props.onChange(this.props.name, val);
        }.bind(this));
    },

    render: function() {
        var classes = "input input-toggle";
        if (this.state.value == 1) classes += " input-toggle-on";

        return (
            <div className={classes} onClick={this.handleClick}></div>
        );
    }
});