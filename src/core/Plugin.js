/* eslint-disable max-classes-per-file */
import Display from './Display';
import Effect from './Effect';

export default class Plugin {
  static create(module, type) {
    const Type = type === 'effect' ? Effect : Display;

    class PluginClass extends Type {
      constructor() {
        super(module);
      }
    }

    Object.getOwnPropertyNames(module).forEach(name => {
      if (typeof module[name] !== 'function') {
        console.log('1) added', name);
        PluginClass.prototype[name] = module[name];
      }
    });

    Object.getOwnPropertyNames(module.prototype).forEach(name => {
      if (name !== 'constructor') {
        console.log('2) added', name);
        PluginClass.prototype[name] = module.prototype[name];
      }
    });

    return PluginClass;
  }
}
