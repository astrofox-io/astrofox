var MenuItem = React.createClass({
    getDefaultProps: function() {
        return {
            text: '',
            checked: false,
            beginGroup: false,
            onClick: function(){}
        };
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick(this.props.text);
    },

    render: function() {
        var classes = 'menu-item';

        if (this.props.checked) {
            classes += ' checked';
        }

        if (this.props.beginGroup) {
            classes += ' begin-group';
        }

        return (
            <li className={classes}
                onClick={this.handleClick}>
                {this.props.text}
            </li>
        );
    }
});