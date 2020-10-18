import React from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { Flash } from 'view/icons';
import { setActiveReactorId } from 'actions/app';
import { addReactor } from 'actions/reactors';
import { loadScenes } from 'actions/scenes';
import styles from './ReactorButton.less';

export default function ReactorButton({ display, name, min = 0, max = 1, className }) {
  const reactor = display.getReactor(name);

  async function enableReactor() {
    if (reactor) {
      setActiveReactorId(reactor?.id);
    } else {
      const newReactor = await addReactor();

      display.setReactor(name, { id: newReactor.id, min, max });

      setActiveReactorId(newReactor?.id);
      loadScenes();
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
