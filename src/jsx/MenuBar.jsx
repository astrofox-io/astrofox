var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: -1,
            items: [
                {
                    text: 'File',
                    items: [
                        { text: 'New Project', beginGroup: false, checked: false },
                        { text: 'Open Project', beginGroup: false, checked: false },
                        { text: 'Save Project', beginGroup: false, checked: false },
                        { text: 'Import Audio', beginGroup: true, checked: false },
                        { text: 'Save Image', beginGroup: false, checked: false },
                        { text: 'Save Video', beginGroup: false, checked: false },
                        { text: 'Exit', beginGroup: true, checked: false }
                    ]
                },
                {
                    text: 'Edit',
                    items: [
                        { text: 'Settings', beginGroup: false, checked: false }
                    ]
                },
                {
                    text: 'View',
                    items: [
                        { text: 'Control Dock', beginGroup: false, checked: true },
                        { text: 'Full Screen', beginGroup: false, checked: false }
                    ]
                },
                {
                    text: 'Help',
                    items: [
                        { text: 'Register', beginGroup: false, checked: false },
                        { text: 'About', beginGroup: false, checked: false }
                    ]
                }
            ]
        };
    },

    getDefaultProps: function() {
        return {
            onMenuAction: function(){}
        };
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

    toggleChecked: function(action) {
        var items = this.state.items;

        this.state.items.forEach(function(barItem) {
            barItem.items.forEach(function(item, index) {
                if (action === barItem.text + '/' + item.text) {
                    barItem.items[index].checked = !barItem.items[index].checked;
                    this.setState(items);
                }
            });
        });
    },

    render: function() {
        var items = this.state.items.map(function(item, index) {
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