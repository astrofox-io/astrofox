/* eslint-disable max-classes-per-file */
import Display from './Display';
import Effect from './Effect';

export default class Plugin {
  static create(module) {
    const { info, defaultProperties, controls } = module;
    const Type = info.type === 'effect' ? Effect : Display;

    class PluginClass extends Type {
      constructor() {
        super(info, { ...defaultProperties });
      }
    }

    // Add static properties
    PluginClass.info = info;
    PluginClass.controls = controls;
    PluginClass.defaultProperties = defaultProperties;

    // Add methods
    Object.getOwnPropertyNames(module.default.prototype).forEach(name => {
      if (name !== 'constructor') {
        PluginClass.prototype[name] = module.default.prototype[name];
      }
    });

    return PluginClass;
  }
}
