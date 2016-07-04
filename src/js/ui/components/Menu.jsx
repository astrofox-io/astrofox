'use strict';

const React = require('react');
const MenuItem = require('./MenuItem.jsx');

const Menu = (props) => {
    let style = { display: (props.visible) ? 'block' : 'none' };

    let items = props.items.map((item, index) => {
        if (item.type == 'separator') {
            return <div key={index} className="menu-separator" />;
        }
        else if (item.label) {
            return (
                <MenuItem
                    key={index}
                    label={item.label}
                    checked={item.checked}
                    onClick={props.onMenuItemClick.bind(null, item)}
                />
            );
        }
    });

    return (
        <ul className="menu" style={style}>
            {items}
        </ul>
    );
};

Menu.defaultProps = {
    items: [],
    visible: false
};

module.exports = Menu;
