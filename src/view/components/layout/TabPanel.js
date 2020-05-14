import React, { useState, Children, cloneElement } from 'react';
import classNames from 'classnames';
import styles from './TabPanel.less';

export function TabPanel({
  className,
  tabClassName,
  contentClassName,
  tabPosition = 'top',
  activeIndex: initialActiveIndex,
  children,
}) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  function handleTabClick(index) {
    setActiveIndex(index);
  }

  const tabs = [];
  const content = [];

  // Generate tabs and content
  Children.map(children, (child, index) => {
    tabs.push(
      <div
        key={index}
        className={classNames(
          {
            [styles.tab]: true,
            [styles.active]: index === activeIndex,
          },
          tabClassName,
          child.props.className,
        )}
        onClick={() => handleTabClick(index)}
      >
        {child.props.name}
      </div>,
    );

    content.push(
      cloneElement(child, {
        key: index,
        className: child.props.contentClassName,
        visible: index === activeIndex,
      }),
    );
  });

  return (
    <div
      className={classNames(
        styles.panel,
        {
          [styles.positionLeft]: tabPosition === 'left',
          [styles.positionRight]: tabPosition === 'right',
          [styles.positionTop]: tabPosition === 'top',
          [styles.positionBottom]: tabPosition === 'bottom',
        },
        className,
      )}
    >
      <div
        className={classNames({
          [styles.tabs]: true,
          [styles.horizontal]: tabPosition === 'top' || tabPosition === 'bottom',
        })}
      >
        {tabs}
      </div>
      <div className={classNames(styles.content, contentClassName)}>{content}</div>
    </div>
  );
}

export const Tab = ({ visible, className, children }) => (
  <div
    className={classNames(
      {
        [styles.hidden]: !visible,
      },
      className,
    )}
  >
    {children}
  </div>
);
