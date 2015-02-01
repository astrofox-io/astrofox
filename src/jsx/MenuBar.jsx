var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: -1
        };
    },

    getDefaultProps: function() {
        return {
            onMenuAction: function(){}
        };
    },

    componentWillMount: function() {
        this.items = [
            { text: 'File', items: ['New Project', 'Open Project', 'Save Project', '|Import Audio', 'Save Image', 'Save Video', '|Exit'] },
            { text: 'Edit', items: ['Settings'] },
            { text: 'View', items: ['Control Dock', 'Full Screen'] },
            { text: 'Help', items: ['Register', 'About'] }
        ];
    },

    handleClick: function(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    },

    handleMouseOver: function(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    },

    handleItemClick: function(action) {
        this.setActiveIndex(-1);
        this.props.onMenuAction(action);
    },

    setActiveIndex: function(index) {
        this.setState({ activeIndex: index });
    },

    render: function() {
        var items = this.items.map(function(item, index) {
            return (
                <MenuBarItem
                    key={"menubaritem" + index}
                    text={item.text}
                    items={item.items}
                    active={this.state.activeIndex === index}
                    onClick={this.handleClick.bind(this, index)}
                    onMouseOver={this.handleMouseOver.bind(this, index)}
                    onItemClick={this.handleItemClick}
                />
            );
        }, this);

        return (
            <div id="menu">
                <ul>{items}</ul>
            </div>
        );
    }
});