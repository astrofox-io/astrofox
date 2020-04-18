import {
  MeshNormalMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshLambertMaterial,
  MeshDepthMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  PointsMaterial,
  Color,
  Object3D,
  Texture,
  BoxBufferGeometry,
  SphereBufferGeometry,
  DodecahedronBufferGeometry,
  IcosahedronBufferGeometry,
  OctahedronBufferGeometry,
  TetrahedronBufferGeometry,
  TorusBufferGeometry,
  TorusKnotBufferGeometry,
  LineSegments,
  EdgesGeometry,
  LineBasicMaterial,
  Points,
  FrontSide,
  DoubleSide,
  Mesh,
} from 'three';
import Display from 'core/Display';
import SpectrumParser from 'audio/SpectrumParser';
import POINT_SPRITE from 'assets/images/point.png';

const materialOptions = {
  Normal: MeshNormalMaterial,
  Basic: MeshBasicMaterial,
  Phong: MeshPhongMaterial,
  Lambert: MeshLambertMaterial,
  Depth: MeshDepthMaterial,
  Standard: MeshStandardMaterial,
  Physical: MeshPhysicalMaterial,
  Points: PointsMaterial,
};

const POINT_SIZE = 5.0;

export default class GeometryDisplay extends Display {
  static label = 'Geometry (3D)';

  static className = 'GeometryDisplay';

  static defaultProperties = {
    shape: 'Box',
    material: 'Standard',
    shading: 'Smooth',
    color: '#FFFFFF',
    wireframe: false,
    edges: false,
    edgeColor: '#FFFFFF',
    x: 0,
    y: 0,
    z: 0,
    opacity: 1.0,
    startX: 0,
    startY: 0,
    startZ: 0,
    seed: 0,
  };

  constructor(properties) {
    super(GeometryDisplay, properties);

    this.parser = new SpectrumParser({ normalize: true });
    this.hasGeometry = true;
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      // Create new mesh
      if (
        properties.shape !== undefined ||
        properties.material !== undefined ||
        properties.shading !== undefined ||
        properties.lines !== undefined ||
        properties.edges !== undefined ||
        properties.edgeColor !== undefined
      ) {
        this.createMesh();
      }
      // Change wireframe
      else if (properties.wireframe !== undefined) {
        if (this.properties.material !== 'Points') {
          this.material.wireframe = properties.wireframe;
        }
      }
      // Change opacity
      else if (properties.opacity !== undefined) {
        this.material.opacity = properties.opacity;
      }
      // Change color
      else if (properties.color !== undefined) {
        this.material.color = new Color().set(properties.color);
      }
      // Change position
      else if (properties.x !== undefined || properties.y !== undefined || properties.z !== undefined) {
        this.mesh.position.set(this.properties.x, this.properties.y, this.properties.z);
      }
      // Change visibility
      else if (properties.enabled !== undefined) {
        this.group.visible = properties.enabled;
      }
    }

    return changed;
  }

  addToScene(scene) {
    this.group = new Object3D();

    // Load point sprite image
    const img = document.createElement('img');

    this.sprite = new Texture(img);

    img.onload = () => {
      this.sprite.transparent = true;
      this.sprite.needsUpdate = true;
    };

    img.src = POINT_SPRITE;

    this.createMesh();

    scene.scene.add(this.group);
  }

  removeFromScene(scene) {
    if (this.group) {
      scene.scene.remove(this.group);
    }
  }

  renderToScene(scene, data) {
    if (!data.hasUpdate) return;

    const { mesh, properties, parser } = this;

    const fft = parser.parseFFT(data.fft);
    const x = fft[0];
    const y = fft[3];
    const z = fft[2];

    mesh.rotation.x += 5 * x;
    mesh.rotation.y += 3 * y;
    mesh.rotation.z += 2 * z;
    mesh.position.set(properties.x, properties.y, properties.z);
  }

  createMesh() {
    const { group, properties } = this;

    if (!group) return;

    let { mesh } = this;

    let geometry;
    let rotation;

    if (mesh) {
      rotation = mesh.rotation.clone();
      group.remove(mesh);
    }

    mesh = new Object3D();

    // Set geometry
    switch (properties.shape) {
      case 'Box':
        // width, height, depth, widthSegments:1, heightSegments:1, depthSegments:1
        geometry = new BoxBufferGeometry(50, 50, 50);
        break;
      case 'Sphere':
        // radius:50, widthSegments:8, heightSegments:6, phiStart:0, phiLength:PI*2, thetaStart:0, thetaLength:PI
        geometry = new SphereBufferGeometry(40, 10, 10);
        break;
      case 'Dodecahedron':
        // radius:1, detail:0
        geometry = new DodecahedronBufferGeometry(40, 0);
        break;
      case 'Icosahedron':
        // radius:1, detail:0
        geometry = new IcosahedronBufferGeometry(40, 0);
        break;
      case 'Octahedron':
        // radius:1, detail:0
        geometry = new OctahedronBufferGeometry(40, 0);
        break;
      case 'Tetrahedron':
        // radius:1, detail:0
        geometry = new TetrahedronBufferGeometry(40, 0);
        break;
      case 'Torus':
        // radius:100, tube:40, radialSegments:8, tubularSegments:6, arc:PI*2
        geometry = new TorusBufferGeometry(50, 20, 10, 10);
        break;
      case 'Torus Knot':
        // radius:100, tube:40, radialSegments:64, tubularSegments:8, p:2, q:3, heightScale:1
        geometry = new TorusKnotBufferGeometry(50, 10, 20, 10);
        break;
    }

    // Add edges
    if (properties.edges && properties.material !== 'Points') {
      mesh.add(
        new LineSegments(
          new EdgesGeometry(geometry, 2),
          new LineBasicMaterial({
            color: new Color().set(properties.edgeColor),
            transparent: true,
            opacity: 0.9,
          }),
        ),
      );
    }

    // Get material
    const material = new materialOptions[properties.material]();

    // Create mesh
    if (properties.material === 'Points') {
      Object.assign(material, {
        size: POINT_SIZE,
        sizeAttenuation: true,
        map: this.sprite,
        transparent: true,
        alphaTest: 0.5,
        color: new Color().set(properties.color),
        needsUpdate: true,
      });

      mesh.add(new Points(geometry, material));
    } else {
      Object.assign(material, {
        flatShading: properties.shading === 'Flat',
        color: new Color().set(properties.color),
        opacity: properties.opacity,
        wireframe: properties.wireframe,
        needsUpdate: true,
        transparent: true,
        side: properties.material === 'Basic' ? FrontSide : DoubleSide,
      });

      mesh.add(new Mesh(geometry, material));
    }

    group.add(mesh);

    mesh.position.set(properties.x, properties.y, properties.z);

    if (rotation) {
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    this.mesh = mesh;
    this.material = material;
  }
}
