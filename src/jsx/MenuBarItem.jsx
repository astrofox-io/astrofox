var MenuBarItem = React.createClass({
    getInitialState: function() {
        return {
            showItems: false
        };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.active !== 'undefined') {
            this.setState({ showItems: props.active });
        }
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    },

    handleMouseOver: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    },

    handleItemClick: function(text) {
        var action = this.props.text + '/' + text;
        this.props.onItemClick(action);
    },

    render: function() {
        var style = { display: (this.state.showItems) ? 'block' : 'none' };
        var classes = "menubar-item";
        if (this.props.active) {
            classes += " active";
        }
        var beginGroup = false;
        var items = this.props.items.map(function(item, index) {
            var beginGroup = item.indexOf('|') === 0,
                text = (beginGroup) ? item.substr(1) : item;
            return (
                <MenuItem
                    key={"menuitem" + index}
                    text={text}
                    beginGroup={beginGroup}
                    onClick={this.handleItemClick}
                />
            );
        }, this);

        return (
            <li>
                <div className={classes}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}>
                    {this.props.text}
                </div>
                <ul className="menu"
                    style={style}>
                    {items}
                </ul>
            </li>
        );
    }
});