import Display from './Display';
import Effect from './Effect';

interface PluginDefinition {
  config: {
    name: string;
    label: string;
    type: string;
    defaultProperties: Record<string, unknown>;
  };
  prototype: Record<string, unknown>;
  [key: string]: unknown;
}

const Plugin = {
  create(plugin: PluginDefinition) {
    const Type = plugin.config.type === 'effect' ? Effect : Display;

    class PluginClass extends Type {
      [key: string]: unknown;

      constructor(properties?: Record<string, unknown>) {
        super(plugin, properties);
      }
    }

    Object.getOwnPropertyNames(plugin).forEach(name => {
      if ((PluginClass as unknown as Record<string, unknown>)[name] === undefined) {
        (PluginClass as unknown as Record<string, unknown>)[name] = plugin[name];
      }
    });

    Object.getOwnPropertyNames(plugin.prototype).forEach(name => {
      if (name !== 'constructor') {
        (PluginClass.prototype as Record<string, unknown>)[name] = plugin.prototype[name];
      }
    });

    return PluginClass;
  },
};

export default Plugin;
