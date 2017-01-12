'use strict';

const React = require('react');
const classNames = require('classnames');
const MenuItem = require('./MenuItem.jsx');

const Menu = (props) => {
    let classes = {
        menu: true,
        'display-none': (props.visible === false)
    };

    let items = props.items.map((item, index) => {
        if (item.type == 'separator') {
            return <div key={index} className="separator" />;
        }
        else if (item.label && item.visible !== false) {
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

        return null;
    });

    return (
        <div className={classNames(classes)}>
            {items}
        </div>
    );
};

Menu.defaultProps = {
    items: [],
    visible: false
};

module.exports = Menu;
