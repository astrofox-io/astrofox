import React from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { Flash } from 'view/icons';
import { addReactor } from 'actions/reactors';
import { setActiveReactorId } from 'actions/app';
import { loadScenes } from 'actions/scenes';
import styles from './ReactorButton.less';

export default function ReactorButton({ display, name, min = 0, max = 1, className }) {
  const dispatch = useDispatch();
  const reactor = display.getReactor(name);

  async function enableReactor() {
    if (reactor) {
      dispatch(setActiveReactorId(reactor.id));
    } else {
      const newReactor = await dispatch(addReactor());

      display.setReactor(name, { id: newReactor.id, min, max });

      dispatch(setActiveReactorId(newReactor.id));
      dispatch(loadScenes());
    }
  }

  return (
    <Icon
      className={classNames(styles.icon, className, {
        [styles.iconActive]: reactor,
      })}
      glyph={Flash}
      title={reactor ? 'Show Reactor' : 'Enable Reactor'}
      onClick={enableReactor}
    />
  );
}
