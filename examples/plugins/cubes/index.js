/**
 * Example worker-runtime 3D display plugin with a host-controlled camera.
 *
 * `"camera": true` in the manifest tells Astrofox this display owns a 3D
 * camera. The host then:
 *   - adds `cameraAzimuth`, `cameraPolar` and `cameraDistance` properties
 *     (with a "Camera" control group) to the display, and
 *   - lets the user orbit/dolly the camera on the stage: drag and wheel edit
 *     those three properties live, so they arrive here through update().
 *
 * The plugin owns everything else — scene, lights, materials — and simply
 * positions its PerspectiveCamera from those three values every frame.
 * `cameraDistance === 0` means "auto": fit the canvas height at the FOV.
 *
 * Renders an animated wall of extruded cubes (instanced) with a shadow-
 * catching ground plane, using the host-provided three.js and the host's
 * shared WebGLRenderer (one GL context per plugin, pre-configured to match
 * the stage: transparent clear, sRGB output, no tone mapping, soft shadows).
 */
export default function createPlugin({ properties, libraries, renderer }) {
  const THREE = libraries.three;

  const FOV = 50;
  const TAU = Math.PI * 2;
  const DEPTH_BASE_RATIO = 0.1;
  const DEPTH_MAX_RATIO = 3.6;
  const EDGE_SEGMENTS = 12;

  let props = { ...properties };
  let scene = null;
  let camera = null;
  let group = null;
  let ground = null;
  let keyLight = null;
  let fillLight = null;
  let ambient = null;
  let surfaceMesh = null;
  let edgeMesh = null;
  let surfaceMaterial = null;
  let edgeMaterial = null;
  let materialKey = '';
  let time = 0;

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  boxGeometry.translate(0, 0.5, 0);
  const edgeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // Very dark albedo reads as "lighting is broken" on lit materials; lift it
  // toward a dark neutral so light color/intensity remain visible.
  function liftedColor(value) {
    const color = new THREE.Color(String(value || '#000000'));
    const luminance = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
    if (luminance >= 0.12) {
      return color;
    }
    return color.lerp(new THREE.Color('#383838'), clamp((0.12 - luminance) / 0.12, 0, 1));
  }

  // ---- procedural grid motion (same shapes as the core MeshGrid display) ----
  function sampleMotion(motion, u, v, ctx, amplitude) {
    const { time: t, fx, fy, favg } = ctx;
    const cu = u - 0.5;
    const cv = v - 0.5;
    const radial = Math.sqrt(cu * cu + cv * cv);
    const norm = clamp(radial / Math.sqrt(0.5), 0, 1);
    const angle = Math.atan2(cv, cu);

    switch (motion) {
      case 'Static':
        return (Math.sin(u * fx * TAU) + Math.sin(v * fy * TAU)) * 0.5 * amplitude;
      case 'Vertical':
        return Math.sin((v * fy - t) * TAU) * amplitude;
      case 'Diagonal':
        return Math.sin(((u * 0.72 + v * 0.28) * favg - t) * TAU) * amplitude;
      case 'Radial':
        return Math.sin((norm * 3 * favg - t * 0.75) * TAU) * (1 - norm * 0.35) * amplitude;
      case 'Sweep':
        return (
          Math.sin(angle * favg * 4 + t * TAU + radial * 6) * (0.55 + (1 - norm) * 0.45) * amplitude
        );
      case 'Noise': {
        const a = Math.sin((u * fx * 12 + t * 1.7) * 1.9 + Math.sin((v * fy * 12 - t * 1.3) * 0.8));
        const b = Math.cos((v * fy * 12 - t * 1.1) * 1.6 + Math.sin((u * fx * 12 + t * 0.7) * 0.7));
        return (a + b) * 0.5 * amplitude;
      }
      default:
        return Math.sin((u * fx - t) * TAU) * amplitude;
    }
  }

  // ---- materials ----
  function createSurfaceMaterial(kind, options) {
    switch (kind) {
      case 'Basic':
        return new THREE.MeshBasicMaterial(options);
      case 'Lambert':
        return new THREE.MeshLambertMaterial(options);
      case 'Normal':
        return new THREE.MeshNormalMaterial(options);
      case 'Phong':
        return new THREE.MeshPhongMaterial(options);
      case 'Physical':
        return new THREE.MeshPhysicalMaterial(options);
      default:
        return new THREE.MeshStandardMaterial(options);
    }
  }

  function ensureMaterials() {
    const kind = String(props.material || 'Standard');
    const flat = props.shading === 'Flat';
    const key = `${kind}:${flat}`;

    if (surfaceMaterial && key === materialKey) {
      return;
    }

    surfaceMaterial?.dispose();
    surfaceMaterial = createSurfaceMaterial(kind, {
      transparent: true,
      flatShading: flat,
      roughness: 0.72,
      metalness: 0.04,
    });
    materialKey = key;

    if (!edgeMaterial) {
      edgeMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        roughness: 0.7,
        metalness: 0.03,
      });
    }

    if (surfaceMesh) {
      surfaceMesh.material = surfaceMaterial;
    }
  }

  function ensureInstances(cubeCount) {
    if (
      !surfaceMesh ||
      surfaceMesh.count !== cubeCount ||
      surfaceMesh.instanceMatrix.count < cubeCount
    ) {
      if (surfaceMesh) {
        group.remove(surfaceMesh);
        surfaceMesh.dispose();
      }
      surfaceMesh = new THREE.InstancedMesh(boxGeometry, surfaceMaterial, cubeCount);
      surfaceMesh.castShadow = true;
      surfaceMesh.receiveShadow = true;
      surfaceMesh.frustumCulled = false;
      group.add(surfaceMesh);
    }

    const edgeCount = cubeCount * EDGE_SEGMENTS;
    if (!edgeMesh || edgeMesh.instanceMatrix.count < edgeCount) {
      if (edgeMesh) {
        group.remove(edgeMesh);
        edgeMesh.dispose();
      }
      edgeMesh = new THREE.InstancedMesh(edgeGeometry, edgeMaterial, edgeCount);
      edgeMesh.frustumCulled = false;
      group.add(edgeMesh);
    }
  }

  function setInstance(mesh, index, x, y, z, sx, sy, sz) {
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }

  function writeEdges(index, cx, cz, size, depth, thickness) {
    const half = size / 2;
    const halfT = thickness / 2;
    const topY = Math.max(halfT, depth - halfT);
    const midY = depth / 2;
    let i = index;
    // bottom + top rims along X
    setInstance(edgeMesh, i++, cx, halfT, cz + half, size, thickness, thickness);
    setInstance(edgeMesh, i++, cx, halfT, cz - half, size, thickness, thickness);
    setInstance(edgeMesh, i++, cx, topY, cz + half, size, thickness, thickness);
    setInstance(edgeMesh, i++, cx, topY, cz - half, size, thickness, thickness);
    // bottom + top rims along Z
    setInstance(edgeMesh, i++, cx - half, halfT, cz, thickness, thickness, size);
    setInstance(edgeMesh, i++, cx + half, halfT, cz, thickness, thickness, size);
    setInstance(edgeMesh, i++, cx - half, topY, cz, thickness, thickness, size);
    setInstance(edgeMesh, i++, cx + half, topY, cz, thickness, thickness, size);
    // vertical pillars
    setInstance(edgeMesh, i++, cx - half, midY, cz + half, thickness, depth, thickness);
    setInstance(edgeMesh, i++, cx + half, midY, cz + half, thickness, depth, thickness);
    setInstance(edgeMesh, i++, cx - half, midY, cz - half, thickness, depth, thickness);
    setInstance(edgeMesh, i++, cx + half, midY, cz - half, thickness, depth, thickness);
    return i;
  }

  // ---- camera: driven by the host's cameraAzimuth/cameraPolar/cameraDistance ----
  function updateCamera(width, height) {
    const autoDistance = height / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
    const azimuth = num(props.cameraAzimuth, 0);
    const polar = clamp(num(props.cameraPolar, 0), -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
    const distance = clamp(num(props.cameraDistance, 0) || autoDistance, 50, 5000);
    const cosPolar = Math.cos(polar);

    camera.aspect = width / height;
    camera.position.set(
      Math.sin(azimuth) * cosPolar * distance,
      Math.sin(polar) * distance,
      Math.cos(azimuth) * cosPolar * distance,
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function updateLights(gridSpan) {
    const shadows = Boolean(props.shadows);
    keyLight.color.set(String(props.keyLightColor || '#FFFFFF'));
    keyLight.intensity = Math.max(0, num(props.keyLightIntensity, 2.2));
    keyLight.castShadow = shadows;
    fillLight.color.set(String(props.fillLightColor || '#FFFFFF'));
    fillLight.intensity = Math.max(0, num(props.fillLightIntensity, 0.75));
    ground.visible = shadows;

    // Keep the shadow frustum wrapped around the grid.
    const span = Math.max(200, gridSpan * 0.8);
    const cam = keyLight.shadow.camera;
    if (cam.left !== -span) {
      cam.left = -span;
      cam.right = span;
      cam.top = span;
      cam.bottom = -span;
      cam.near = 1;
      cam.far = 6000;
      cam.updateProjectionMatrix();
    }
  }

  function resolveSize() {
    return {
      width: Math.max(16, Math.round(num(props.width, 1280))),
      height: Math.max(16, Math.round(num(props.height, 720))),
    };
  }

  return {
    init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 5000);
      group = new THREE.Group();
      scene.add(group);

      // Own lighting rig: ambient + shadow-casting key + fill.
      ambient = new THREE.AmbientLight(0xffffff, 0.35);
      keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(-0.42 * 700, 1.4 * 700, 0.58 * 700);
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.bias = -0.00035;
      keyLight.shadow.normalBias = 0.02;
      fillLight = new THREE.PointLight(0xffffff, 0.75, 0, 0);
      fillLight.position.set(0.8 * 700, 0.52 * 700, 0.72 * 700);
      scene.add(ambient, keyLight, keyLight.target, fillLight);

      ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShadowMaterial({ transparent: true, opacity: 0.68 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      group.add(ground);

      ensureMaterials();
    },

    update(properties) {
      props = { ...props, ...properties };
    },

    render(frame) {
      const { width, height } = resolveSize();
      // The renderer is shared by every instance of this plugin, so size it
      // for this instance before drawing.
      renderer.setSize(width, height, false);

      if (frame.playing || frame.exporting) {
        time += (Math.max(0, num(frame.delta, 16.667)) / 1000) * Math.max(0, num(props.speed, 1));
      }

      const rows = Math.max(1, Math.round(num(props.rows, 8)));
      const columns = Math.max(1, Math.round(num(props.columns, 8)));
      const separation = Math.max(8, num(props.separation, 32));
      const gridWidth = separation * columns;
      const gridHeight = separation * rows;
      const gap = clamp(num(props.gap, 2), 0, Math.max(0, separation - 2));
      const cubeSize = Math.max(2, separation - gap);
      const baseDepth = Math.max(4, separation * DEPTH_BASE_RATIO);
      const maxDepth = separation * DEPTH_MAX_RATIO;
      const extrusion = Math.max(0, num(props.extrusion, 28));
      const motion = String(props.motion || 'Radial');
      const fx = Math.max(0.05, num(props.frequencyX, 0.3));
      const fy = Math.max(0.05, num(props.frequencyY, 0.5));
      const ctx = { time, fx, fy, favg: (fx + fy) * 0.5 };
      const edges = Boolean(props.edges);
      const materialKind = String(props.material || 'Standard');

      ensureMaterials();
      ensureInstances(rows * columns);

      // Surface / edge material state.
      const surfaceColor = liftedColor(props.color);
      if (materialKind !== 'Normal') {
        surfaceMaterial.color.copy(surfaceColor);
      }
      if (surfaceMaterial.emissive) {
        surfaceMaterial.emissive.copy(
          tmpColor.set(String(props.color || '#000000')).multiplyScalar(0.08),
        );
      }
      surfaceMaterial.wireframe = Boolean(props.wireframe);
      surfaceMaterial.opacity = 1;
      edgeMaterial.color.copy(liftedColor(props.edgeColor));
      edgeMaterial.opacity = 0.95;

      // Cube transforms.
      let edgeIndex = 0;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const u = columns <= 1 ? 0 : column / (columns - 1);
          const v = rows <= 1 ? 0 : row / (rows - 1);
          const displacement = sampleMotion(motion, u, v, ctx, extrusion);
          const depth = clamp(baseDepth + displacement, 2, baseDepth + maxDepth);
          const x = -gridWidth / 2 + separation * (column + 0.5);
          const z = -gridHeight / 2 + separation * (row + 0.5);
          const index = row * columns + column;

          setInstance(surfaceMesh, index, x, 0, z, cubeSize, depth, cubeSize);

          if (edges) {
            const thickness = clamp(Math.min(cubeSize, depth) * 0.08, 0.8, 3.5);
            edgeIndex = writeEdges(edgeIndex, x, z, cubeSize, depth, thickness);
          }
        }
      }
      surfaceMesh.instanceMatrix.needsUpdate = true;
      edgeMesh.count = edgeIndex;
      edgeMesh.visible = edges && edgeIndex > 0;
      edgeMesh.instanceMatrix.needsUpdate = true;

      ground.scale.set(gridWidth + cubeSize, gridHeight + cubeSize, 1);
      ground.position.y = -maxDepth * 0.02;

      updateLights(Math.max(gridWidth, gridHeight));
      updateCamera(width, height);

      renderer.render(scene, camera);

      return { width, height };
    },

    dispose() {
      surfaceMesh?.dispose();
      edgeMesh?.dispose();
      surfaceMaterial?.dispose();
      edgeMaterial?.dispose();
      ground?.geometry.dispose();
      ground?.material.dispose();
      boxGeometry.dispose();
      edgeGeometry.dispose();
    },
  };
}
