var ModalWindow = React.createClass({
    getInitialState: function() {
        return {
            content: '',
            visible: false
        };
    },

    getDefaultProps: function() {
        return {
            width: 400,
            height: 300,
            visible: false
        }
    },

    componentDidMount: function() {
        this.setState({ visible: this.props.visible });
    },

    componentWillReceiveProps: function(props) {
        var obj = {};
        for (var prop in props) {
            if (this.state.hasOwnProperty.call(prop)) {
                obj[prop] = props[prop];
            }
        }
        this.setState(obj);
    },

    handleClick: function() {
        this.setState({ visible: false });
    },

    show: function(content, callback) {
        this.setState({
            content: content,
            visible: true
        }, callback);
    },

    isVisible: function() {
        return this.state.visible;
    },

    render: function() {
        var style = { display: (this.state.visible) ? 'block' : 'none' };

        var windowStyle = {
            width: this.props.width + 'px',
            height: this.props.height + 'px'
        };

        return (
            <div onClick={this.handleClick} style={style}>
                <div id="overlay" />
                <div id="modal" style={windowStyle}>
                    {this.state.content}
                </div>
            </div>
        );
    }
});