import Display from 'core/Display';

export default class WebglDisplay extends Display {
  constructor(info, properties) {
    super(info, properties);

    Object.defineProperty(this, 'type', { value: 'webgl', configurable: true });
  }
}
