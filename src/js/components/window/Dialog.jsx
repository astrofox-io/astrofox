import React from 'react';
import classNames from 'classnames';

const Dialog = (props) => {
    let icon = (props.icon) ?
        <span className={classNames('icon', props.icon)}/> :
        null;

    return (
        <div className="dialog">
            {icon}
            <span className="message">{props.message}</span>
        </div>
    );
};

export default Dialog;