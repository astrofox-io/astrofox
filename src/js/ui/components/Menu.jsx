'use strict';

const React = require('react');
const MenuItem = require('./MenuItem.jsx');

const Menu = (props) => {
    let style = { display: (props.visible) ? 'block' : 'none' };

    let items = props.items.map((item, index) => {
        if (item.type == 'separator') {
            return <div key={index} className="separator" />;
        }
        else if (item.label) {
            return (
                <MenuItem
                    key={index}
                    label={item.label}
                    checked={item.checked}
                    disabled={item.disabled}
                    onClick={props.onMenuItemClick.bind(null, item)}
                />
            );
        }
    });

    return (
        <div className="menu" style={style}>
            {items}
        </div>
    );
};

Menu.defaultProps = {
    items: [],
    visible: false
};

module.exports = Menu;
