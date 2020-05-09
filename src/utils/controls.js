import Entity from 'core/Entity';
import SceneControl from 'components/controls/SceneControl';
import EmptyControl from 'components/controls/EmptyControl';
import * as controlComponents from 'components/controls';
import * as displays from 'displays';
import * as effects from 'effects';

const library = { ...displays, ...effects };

export function getControlComponent(display) {
  const { className } = display.constructor;

  if (className === 'Scene') {
    return SceneControl;
  }

  let control = null;

  Object.keys(library).forEach(key => {
    if (!control && key === className) {
      const name = /(\w+)(Display|Effect)/.exec(key);

      control = controlComponents[`${name[1]}Control`];
    }
  });

  return control || EmptyControl;
}

export function getDisplayEntity(config) {
  const { name } = config;
  const Component = displays[name] || effects[name];

  if (Component) {
    return Entity.create(Component, config);
  }

  return null;
}
