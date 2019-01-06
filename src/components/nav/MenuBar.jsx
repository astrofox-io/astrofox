import React, { Component } from 'react';
import MenuBarItem from 'components/nav/MenuBarItem';
import styles from './Menu.less';

export default class MenuBar extends Component {
    static defaultProps = {
        items: [],
        activeIndex: -1,
    }

    state = {
        items: this.props.items,
    }

    componentDidMount() {
        window.addEventListener('click', this.handleDocumentClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleDocumentClick);
    }

    handleDocumentClick = () => {
        this.setActiveIndex(-1);
    }

    handleClick = index => () => {
        const { activeIndex } = this.state;

        this.setActiveIndex(activeIndex === index ? -1 : index);
    }

    handleMouseOver = index => () => {
        const { activeIndex } = this.state;

        if (activeIndex > -1) {
            this.setActiveIndex(index);
        }
    }

    handleMenuItemClick = (action, checked) => {
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
            this.setState({ activeIndex: index });
        }
    }

    setCheckState(action) {
        const { items } = this.state;

        items.forEach((barItem) => {
            if (barItem.submenu) {
                barItem.submenu.forEach((menuItem) => {
                    if (action === menuItem.action) {
                        menuItem.checked = !menuItem.checked;
                        this.setState({ items: items.slice() });
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
                    items.map(({ hidden, label, submenu }, index) => (
                        !hidden && (
                            <MenuBarItem
                                key={index}
                                label={label}
                                items={submenu}
                                active={activeIndex === index}
                                onClick={this.handleClick(index)}
                                onMouseOver={this.handleMouseOver(index)}
                                onMenuItemClick={this.handleMenuItemClick}
                            />
                        )
                    ))
                }
            </div>
        );
    }
}
