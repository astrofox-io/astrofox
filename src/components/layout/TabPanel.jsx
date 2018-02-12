import React, { PureComponent, Children, cloneElement } from 'react';
import classNames from 'classnames';
import styles from './TabPanel.less';

export class TabPanel extends PureComponent {
    static defaultProps = {
        tabPosition: 'top',
    }

    constructor(props) {
        super(props);

        this.state = {
            activeIndex: props.activeIndex,
        };
    }

    onTabClick = (index) => {
        this.setState({ activeIndex: index });
    }

    render() {
        const {
            tabPosition,
            className,
            tabClassName,
            contentClassName,
            children,
        } = this.props;
        const { activeIndex } = this.state;
        const tabs = [];
        const content = [];

        // Generate tabs and content
        Children.map(children, (child, index) => {
            tabs.push((
                <div
                    key={index}
                    className={classNames({
                        [styles.tab]: true,
                        [styles.active]: index === activeIndex,
                    }, tabClassName, child.props.className)}
                    onClick={() => this.onTabClick(index)}
                >
                    {child.props.name}
                </div>
            ));

            content.push(cloneElement(
                child,
                {
                    key: index,
                    className: child.props.contentClassName,
                    visible: index === activeIndex,
                },
            ));
        });

        return (
            <div
                className={classNames({
                    [styles.panel]: true,
                    [styles.positionLeft]: tabPosition === 'left',
                    [styles.positionRight]: tabPosition === 'right',
                    [styles.positionTop]: tabPosition === 'top',
                    [styles.positionBottom]: tabPosition === 'bottom',
                }, className)}
            >
                <div
                    className={classNames({
                        [styles.tabs]: true,
                        [styles.horizontal]: tabPosition === 'top' || tabPosition === 'bottom',
                    })}
                >
                    {tabs}
                </div>
                <div className={classNames(styles.content, contentClassName)}>
                    {content}
                </div>
            </div>
        );
    }
}

export const Tab = ({ visible, className, children }) => (
    <div
        className={classNames({
            [styles.hidden]: !visible,
        }, className)}
    >
        {children}
    </div>
);
