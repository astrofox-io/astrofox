/**
 * Example 3D worker-runtime display plugin. Requests the host's copy of
 * three.js via "libraries": ["three"] in the manifest, so nothing needs to
 * be bundled. The host also hands over its shared, pre-configured
 * WebGLRenderer; the plugin builds a scene and renders a lit icosphere with
 * it. Vertices are displaced by the spectrum every frame; all motion derives
 * from frame.time so video export is deterministic.
 */
export default function createPlugin({ properties, libraries, renderer }) {
  const THREE = libraries.three;

  let props = { ...properties };
  let scene = null;
  let camera = null;
  let mesh = null;
  let light = null;
  let basePositions = null;
  let currentDetail = -1;

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function buildMesh(detail) {
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }

    const geometry = new THREE.SphereGeometry(1, detail, detail);
    basePositions = geometry.attributes.position.array.slice();

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(String(props.color || '#33ccff')),
      roughness: 0.35,
      metalness: 0.2,
      flatShading: true,
      wireframe: Boolean(props.wireframe),
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    currentDetail = detail;
  }

  function resize() {
    const width = Math.max(16, Math.round(num(props.width, 720)));
    const height = Math.max(16, Math.round(num(props.height, 720)));

    // The renderer is shared by every instance of this plugin: size it for
    // this instance every frame.
    renderer.setSize(width, height, false);
    if (camera.aspect !== width / height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    return { width, height };
  }

  return {
    init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      light = new THREE.PointLight(0xffffff, 40);
      light.position.set(3, 3, 4);
      scene.add(light);

      buildMesh(Math.round(num(props.detail, 24)));
    },

    update(properties) {
      props = { ...props, ...properties };
    },

    render(frame) {
      const fft = frame.fft || new Float32Array(64);
      const detail = Math.max(4, Math.min(64, Math.round(num(props.detail, 24))));

      const size = resize();

      if (detail !== currentDetail) {
        buildMesh(detail);
      }

      const { material, geometry } = mesh;
      material.color.set(String(props.color || '#33ccff'));
      material.wireframe = Boolean(props.wireframe);
      light.color.set(String(props.lightColor || '#ffffff'));

      const radius = num(props.radius, 1);
      const displacement = num(props.displacement, 0.5);
      const positions = geometry.attributes.position;
      const count = positions.count;
      const bins = fft.length;

      // Displace each vertex along its normal by a spectrum bin chosen from
      // its latitude, so bass drives the poles and highs the equator.
      for (let i = 0; i < count; i += 1) {
        const x = basePositions[i * 3];
        const y = basePositions[i * 3 + 1];
        const z = basePositions[i * 3 + 2];
        const band = Math.min(bins - 1, Math.floor(Math.abs(y) * (bins - 1)));
        const wobble = Math.sin(frame.time * 2 + x * 3 + z * 3) * 0.05;
        const r = radius * (1 + fft[band] * displacement + wobble);
        positions.setXYZ(i, x * r, y * r, z * r);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      const speed = num(props.rotationSpeed, 0.3);
      mesh.rotation.y = frame.time * speed;
      mesh.rotation.x = frame.time * speed * 0.4;

      renderer.render(scene, camera);

      return size;
    },

    dispose() {
      mesh?.geometry.dispose();
      mesh?.material.dispose();
    },
  };
}
