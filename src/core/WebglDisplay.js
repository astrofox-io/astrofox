import Display from 'core/Display';

export default class WebglDisplay extends Display {
  constructor(type, properties) {
    super(type, properties);

    Object.defineProperty(this, 'type', { value: 'webgl' });
  }
}
