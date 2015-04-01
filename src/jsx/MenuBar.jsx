var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: -1,
            items: [
                {
                    text: 'File',
                    items: [
                        { text: 'New Project' },
                        { text: 'Open Project' },
                        { text: 'Save Project' },
                        { text: 'Load Audio', beginGroup: true },
                        { text: 'Save Image' },
                        { text: 'Save Video' },
                        { text: 'Exit', beginGroup: true }
                    ]
                },
                {
                    text: 'Edit',
                    items: [
                        { text: 'Settings' }
                    ]
                },
                {
                    text: 'View',
                    items: [
                        { text: 'Control Dock', checked: true },
                        { text: 'Show FPS' },
                        { text: 'Full Screen' }
                    ]
                },
                {
                    text: 'Help',
                    items: [
                        { text: 'Register' },
                        { text: 'About' }
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

    handleItemClick: function(action, checked) {
        this.setActiveIndex(-1);
        this.props.onMenuAction(action, checked);
    },

    setActiveIndex: function(index) {
        this.setState({ activeIndex: index });
    },

    setCheckState: function(action, checked) {
        var items = this.state.items;

        this.state.items.forEach(function(barItem) {
            barItem.items.forEach(function(item, index) {
                if (action === barItem.text + '/' + item.text) {
                    barItem.items[index].checked = checked;
                    this.setState(items);
                }
            }, this);
        }, this);
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
            <div id="menubar">
                <ul>{items}</ul>
            </div>
        );
    }
});