/* eslint-disable max-classes-per-file */
import ShaderPass from 'graphics/ShaderPass';
import Display from './Display';
import Effect from './Effect';

export default class Plugin {
  static create(module) {
    const Type = module.config.type === 'effect' ? Effect : Display;

    class PluginClass extends Type {
      constructor(properties) {
        super(module, properties);

        if (module.shader) {
          this.pass = new ShaderPass(module.shader, properties);
        }
      }
    }

    // Add static properties
    Object.getOwnPropertyNames(module).forEach(name => {
      if (PluginClass[name] === undefined) {
        PluginClass[name] = module[name];
      }
    });

    // Add methods
    Object.getOwnPropertyNames(module.prototype).forEach(name => {
      if (name !== 'constructor') {
        PluginClass.prototype[name] = module.prototype[name];
      }
    });

    return PluginClass;
  }
}
