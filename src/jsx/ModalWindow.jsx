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
        var classes = 'modal';

        if (this.state.visible) {
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
                    <div className="header">TITLE</div>
                    <div className="content">
                        {this.state.content}
                    </div>
                    <div className="buttons">
                        <div className="button" onClick={this.handleClick}>OK</div>
                    </div>
                </div>
            </div>
        );
    }
});