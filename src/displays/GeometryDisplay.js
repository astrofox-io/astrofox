import {
  Scene,
  Mesh,
  PerspectiveCamera,
  PointLight,
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
  TextureLoader,
} from 'three';
import WebglDisplay from 'core/WebglDisplay';
import SpectrumParser from 'audio/SpectrumParser';
import POINT_SPRITE from 'assets/images/point.png';
import { isDefined } from 'utils/array';

const shapeOptions = [
  'Box',
  'Sphere',
  'Dodecahedron',
  'Icosahedron',
  'Octahedron',
  'Tetrahedron',
  'Torus',
  'Torus Knot',
];

const materialOptions = ['Basic', 'Lambert', 'Normal', 'Phong', 'Physical', 'Points', 'Standard'];

const shadingOptions = ['Smooth', 'Flat'];

const materials = {
  Normal: MeshNormalMaterial,
  Basic: MeshBasicMaterial,
  Phong: MeshPhongMaterial,
  Lambert: MeshLambertMaterial,
  Depth: MeshDepthMaterial,
  Standard: MeshStandardMaterial,
  Physical: MeshPhysicalMaterial,
  Points: PointsMaterial,
};

const FOV = 45;
const NEAR = 1;
const FAR = 10000;
const CAMERA_POS_Z = 250;
const POINT_SIZE = 5.0;

export default class GeometryDisplay extends WebglDisplay {
  static config = {
    name: 'GeometryDisplay',
    description: 'Displays 3D geometry.',
    type: 'display',
    label: 'Geometry (3D)',
    defaultProperties: {
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
      lightIntensity: 1.0,
      lightDistance: 500,
      cameraZoom: 250,
    },
    controls: {
      shape: {
        label: 'Shape',
        type: 'select',
        items: shapeOptions,
      },
      material: {
        label: 'Material',
        type: 'select',
        items: materialOptions,
      },
      shading: {
        label: 'Shading',
        type: 'select',
        items: shadingOptions,
      },
      wireframe: {
        label: 'Wireframe',
        type: 'toggle',
      },
      edges: {
        label: 'Edges',
        type: 'toggle',
      },
      edgeColor: {
        label: 'Edge Color',
        type: 'color',
      },
      x: {
        label: 'X',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
      },
      y: {
        label: 'Y',
        type: 'number',
        min: -500,
        max: 500,
        withRange: true,
      },
      z: {
        label: 'Z',
        type: 'number',
        min: -1000,
        max: 1000,
        withRange: true,
      },
      opacity: {
        label: 'Opacity',
        type: 'number',
        min: 0,
        max: 1.0,
        step: 0.01,
        withRange: true,
        withReactor: true,
      },
    },
  };

  constructor(properties) {
    super(GeometryDisplay, properties);

    this.parser = new SpectrumParser({ normalize: true });
  }

  update(properties) {
    const changed = super.update(properties);
    const { lights, camera } = this;
    const {
      shape,
      material,
      shading,
      lines,
      edges,
      edgeColor,
      wireframe,
      opacity,
      color,
      x,
      y,
      z,
      enabled,
      lightDistance,
      lightIntensity,
      cameraZoom,
    } = properties;

    if (changed) {
      // Create new mesh
      if (isDefined(shape, material, shading, lines, edges, edgeColor)) {
        this.createMesh();
      }
      // Change wireframe
      else if (wireframe !== undefined) {
        if (this.properties.material !== 'Points') {
          this.material.wireframe = wireframe;
        }
      }
      // Change opacity
      else if (opacity !== undefined) {
        this.material.opacity = opacity;
      }
      // Change color
      else if (color !== undefined) {
        this.material.color = new Color().set(color);
      }
      // Change position
      else if (isDefined(x, y, z)) {
        this.mesh.position.set(
          x ?? this.properties.x,
          y ?? this.properties.y,
          z ?? this.properties.z,
        );
      }
      // Change visibility
      else if (enabled !== undefined) {
        this.group.visible = enabled;
      }
      // Change lights
      else if (lights && isDefined(lightDistance, lightIntensity)) {
        this.updateLights();
      }
      // Change camera
      else if (camera && cameraZoom !== undefined) {
        camera.position.z = cameraZoom;
      }
    }

    return changed;
  }

  addToScene(scene) {
    const { width, height } = scene.getSize();

    const scene3d = new Scene();
    const camera = new PerspectiveCamera(FOV, width / height, NEAR, FAR);
    const lights = [
      new PointLight(0xffffff, 1, 0),
      new PointLight(0xffffff, 1, 0),
      new PointLight(0xffffff, 1, 0),
    ];
    const group = new Object3D();
    const sprite = new TextureLoader().load(POINT_SPRITE);

    camera.position.set(0, 0, CAMERA_POS_Z);

    scene3d.add(camera);
    scene3d.add(lights[0]);
    scene3d.add(lights[1]);
    scene3d.add(lights[2]);
    scene3d.add(group);

    this.scene3d = scene3d;
    this.camera = camera;
    this.lights = lights;
    this.group = group;
    this.sprite = sprite;

    this.updateLights();
    this.createMesh();
  }

  render(scene, data) {
    const { scene3d, camera, mesh, properties, parser } = this;
    const renderer = scene.getRenderer();

    if (data.hasUpdate) {
      const fft = parser.parseFFT(data.fft);
      const x = fft[0];
      const y = fft[3];
      const z = fft[2];

      mesh.rotation.x += 5 * x;
      mesh.rotation.y += 3 * y;
      mesh.rotation.z += 2 * z;
      mesh.position.set(properties.x, properties.y, properties.z);
    }

    renderer.render(scene3d, camera);
  }

  setSize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  updateLights() {
    const { lights } = this;
    const { lightIntensity, lightDistance } = this.properties;

    lights[0].intensity = lightIntensity;
    lights[1].intensity = lightIntensity;
    lights[2].intensity = lightIntensity;

    lights[0].position.set(0, lightDistance * 2, 0);
    lights[1].position.set(lightDistance, lightDistance * 2, lightDistance);
    lights[2].position.set(-lightDistance, -lightDistance * 2, -lightDistance);
  }

  createMesh() {
    const { group, properties } = this;

    if (!group) return;

    let geometry;
    let rotation;

    // Remove existing mesh
    if (this.mesh) {
      rotation = this.mesh.rotation.clone();
      group.remove(this.mesh);
    }

    const mesh = new Object3D();

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
    const material = new materials[properties.material]();

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
