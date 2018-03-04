import React from 'react';
import classNames from 'classnames';
import Button from 'components/interface/Button';
import Icon from 'components/interface/Icon';
import closeIcon from 'svg/icons/times.svg';
import styles from './ModalWindow.less';

const ModalWindow = ({
    children, className, title, buttons, showCloseButton, onClose,
}) => (
    <div className={styles.overlay}>
        <div className={classNames(styles.modal, className)}>
            {
                showCloseButton !== false &&
                    <div
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        <Icon
                            className={styles.closeIcon}
                            glyph={closeIcon}
                        />
                    </div>
            }
            {
                title &&
                    <div className={styles.header}>
                        {title}
                    </div>
            }
            <div className={styles.body}>
                {children}
            </div>
            {
                buttons &&
                    <div className={styles.buttons}>
                        {
                            buttons.map((text, index) => (
                                <Button
                                    className={styles.button}
                                    key={index}
                                    text={text}
                                    onClick={() => onClose(text)}
                                />
                            ))
                        }
                    </div>
            }
        </div>
    </div>
);

export default ModalWindow;
