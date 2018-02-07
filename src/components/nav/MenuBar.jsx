import React from 'react';
import MenuBarItem from 'components/nav/MenuBarItem';
import styles from './Menu.less';

export default class MenuBar extends React.Component {
    static defaultProps = {
        items: [],
        activeIndex: -1,
    }

    constructor(props) {
        super(props);

        this.state = {
            items: props.items
        };
    }

    onClick = (index) => () => {
        const { activeIndex } = this.state;

        this.setActiveIndex((activeIndex === index) ? -1 : index);
    }

    onMouseOver = (index) => () => {
        const { activeIndex } = this.state;

        if (activeIndex > -1) {
            this.setActiveIndex(index);
        }
    }

    onMenuItemClick = (action, checked) => {
        const { onMenuAction } = this.props;

        this.setActiveIndex(-1);

        if (onMenuAction) {
            onMenuAction(action, checked);

            if (checked !== undefined) {
                this.setCheckState(action);
            }
        }
    }

    setActiveIndex(index) {
        if (this.state.activeIndex !== index) {
            this.setState({activeIndex: index});
        }
    }

    setCheckState(action) {
        const { items } = this.state;

        items.forEach(barItem => {
            if (barItem.submenu) {
                barItem.submenu.forEach(menuItem => {
                    if (action === menuItem.action) {
                        menuItem.checked = !menuItem.checked;
                        this.setState({ items: [].concat(items) });
                    }
                });
            }
        });
    }

    render() {
        const {
            items,
            activeIndex,
        } = this.state;

        return (
            <div className={styles.menuBar}>
                {
                    items.map(({hidden, label, submenu}, index) => (
                        !hidden &&
                        <MenuBarItem
                            key={index}
                            label={label}
                            items={submenu}
                            active={activeIndex === index}
                            onClick={this.onClick(index)}
                            onMouseOver={this.onMouseOver(index)}
                            onMenuItemClick={this.onMenuItemClick}
                        />
                    ))
                }
            </div>
        );
    }
}