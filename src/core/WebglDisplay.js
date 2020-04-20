import Display from 'core/Display';
import { DISPLAY_TYPE_WEBGL } from 'view/constants';

export default class WebglDisplay extends Display {
  constructor(type, properties) {
    super(type, properties);

    Object.defineProperty(this, 'type', { value: DISPLAY_TYPE_WEBGL });
  }
}
