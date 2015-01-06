var SelectInput = React.createClass({
    getInitialState: function() {
        return {
            value: "",
            showItems: false
        };
    },

    getDefaultProps: function() {
        return {
            name: "select",
            size: 20,
            value: ""
        };
    },

    componentDidMount: function() {
        this.setState({ value: this.props.value });
    },

    componentWillReceiveProps: function(props) {
        this.setState({ value: props.value });
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: !this.state.showItems });
    },

    handleItemClick: function(item) {
        this.setState({ showItems: false }, function(){
            this.props.onChange(this.props.name, item.value);
        }.bind(this));
    },

    handleBlur: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.setState({ showItems: false });
    },

    render: function() {
        var style = { display: this.state.showItems ? 'block' : 'none' };
        var items = [];

        if (this.props.items) {
            items = this.props.items.map(function(item, index) {
                var key = this.props.name + '' + index;
                if (typeof item !== 'object') {
                    item = { name: item, value: item };
                }
                return (
                    <li className="input-option"
                        key={key}
                        style={{fontFamily:item.value}}
                        onMouseDown={this.handleItemClick.bind(this, item)}>
                    {item.name}
                    </li>
                );
            }, this);
        }

        return (
            <div className="input-select">
                <input type="text"
                    className="input-field"
                    name={this.props.name}
                    size={this.props.size}
                    value={this.state.value}
                    onClick={this.handleClick}
                    onBlur={this.handleBlur}
                    readOnly
                />
                <ul className="input-options" style={style}>
                    {items}
                </ul>
            </div>
        );
    }
});