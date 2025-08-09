/**
 * @jest-environment jsdom
 */
import VideoDisplay from 'displays/VideoDisplay';
import { BLANK_IMAGE } from 'view/constants';

jest.mock('three', () => ({
  VideoTexture: class {},
}));

jest.mock('core/WebGLDisplay', () => {
  return class WebGLDisplay {
    constructor(display, properties) {
      this.properties = { ...display.config.defaultProperties, ...properties };
    }
    update() {}
    dispose() {}
  };
});
jest.mock('graphics/ImagePass', () => class {});

describe('VideoDisplay', () => {
  it('should be a display', () => {
    const display = new VideoDisplay();
    expect(display.constructor.config.type).toBe('display');
  });

  it('should have default properties', () => {
    const display = new VideoDisplay();
    expect(display.properties).toEqual({
      src: BLANK_IMAGE,
      x: 0,
      y: 0,
      zoom: 1,
      width: 0,
      height: 0,
      fixed: true,
      rotation: 0,
      opacity: 0,
      loop: true,
      startTime: 0,
      endTime: 0,
    });
  });
});
