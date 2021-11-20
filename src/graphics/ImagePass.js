import {
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
} from 'three';
import Pass from './Pass';

export default class ImagePass extends Pass {
  constructor(texture, resolution) {
    super();

    const { width, height } = resolution;
    const { naturalWidth, naturalHeight } = texture.image;

    this.texture = texture;

    const material = new MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0, 1);
    const geometry = new PlaneBufferGeometry(naturalWidth, naturalHeight);

    this.setFullscreen(material, geometry, camera);
  }

  render(renderer, inputBuffer) {
    const { scene, camera } = this;

    super.render(renderer, scene, camera, inputBuffer);
  }
}
