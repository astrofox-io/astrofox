/* eslint-disable max-classes-per-file */
import Display from './Display';
import Effect from './Effect';

export default class Plugin {
  static create(module, info) {
    const Type = info.type === 'effect' ? Effect : Display;

    class PluginClass extends Type {
      constructor() {
        super(PluginClass);

        Object.defineProperty(this, 'type', { value: 'canvas' });
      }
    }

    // Add static properties
    PluginClass.info = info;
    PluginClass.defaultProperties = module.defaultProperties;

    // Add methods
    Object.getOwnPropertyNames(module.prototype).forEach(name => {
      if (name !== 'constructor') {
        PluginClass.prototype[name] = module.prototype[name];
      }
    });

    return PluginClass;
  }
}
