// @ts-nocheck

import { Color, Vector2, Vector3, Vector4 } from 'three';
import ShaderPass from '@/lib/core/render/composer/ShaderPass';
import vertexShader from '@/lib/shaders/glsl/vertex/basic.glsl';
import type { InstalledPlugin, PluginUniformDef } from './types';

const MAX_SHADER_LENGTH = 256 * 1024;

export function defaultUniformValue(def: PluginUniformDef) {
  switch (def.type) {
    case 'vec2':
      return new Vector2();
    case 'vec3':
      return new Vector3();
    case 'vec4':
      return new Vector4();
    case 'color':
      return new Color(1, 1, 1);
    default:
      return 0;
  }
}

function readVectorValues(props, from, size) {
  const values = Array.isArray(from)
    ? from.map(key => Number(props[key] ?? 0))
    : Array.isArray(props[from])
      ? props[from].map(Number)
      : [Number(props[from] ?? 0)];

  while (values.length < size) {
    values.push(0);
  }

  return values.slice(0, size);
}

export function applyUniform(uniform, def: PluginUniformDef, props) {
  const from = def.from;

  switch (def.type) {
    case 'float':
      uniform.value = Number(props[Array.isArray(from) ? from[0] : from] ?? 0);
      break;
    case 'int':
      uniform.value = Math.round(Number(props[Array.isArray(from) ? from[0] : from] ?? 0));
      break;
    case 'color': {
      const value = props[Array.isArray(from) ? from[0] : from];
      if (typeof value === 'string') {
        uniform.value.set(value);
      } else if (Array.isArray(value)) {
        // Color range properties are [start, end]; use the first color.
        if (typeof value[0] === 'string') {
          uniform.value.set(value[0]);
        } else {
          uniform.value.setRGB(Number(value[0] ?? 1), Number(value[1] ?? 1), Number(value[2] ?? 1));
        }
      }
      break;
    }
    case 'vec2':
      uniform.value.fromArray(readVectorValues(props, from, 2));
      break;
    case 'vec3':
      uniform.value.fromArray(readVectorValues(props, from, 3));
      break;
    case 'vec4':
      uniform.value.fromArray(readVectorValues(props, from, 4));
      break;
  }
}

/**
 * Builds an effectPassRegistry factory for a shader-runtime plugin. The
 * plugin's fragment shader is compiled into the standard ShaderPass contract:
 * inputTexture/resolution plus time/delta/volume and one uniform per manifest
 * "uniforms" entry, kept in sync with the effect's (reactor-modulated)
 * properties every frame.
 */
export function createShaderEffectPassFactory(installed: InstalledPlugin) {
  const { manifest } = installed;
  const fragmentShader = installed.files[manifest.shader];

  if (typeof fragmentShader !== 'string' || !fragmentShader.trim()) {
    throw new Error(`Plugin ${manifest.name} is missing its shader source`);
  }

  if (fragmentShader.length > MAX_SHADER_LENGTH) {
    throw new Error(`Plugin ${manifest.name} shader exceeds the size limit`);
  }

  const uniformDefs = manifest.uniforms || {};

  return (effect, width, height) => {
    const uniforms = {
      inputTexture: { value: null },
      resolution: { value: new Vector2(width, height) },
      time: { value: 0 },
      delta: { value: 0 },
      volume: { value: 0 },
    };

    for (const [name, def] of Object.entries(uniformDefs)) {
      if (uniforms[name] === undefined) {
        uniforms[name] = { value: defaultUniformValue(def) };
      }
    }

    const pass = new ShaderPass({ uniforms, vertexShader, fragmentShader });
    let time = 0;

    pass.__updateScenePass = frameData => {
      pass.enabled = effect.enabled !== false;

      const liveUniforms = pass.material.uniforms;

      if (frameData?.hasUpdate) {
        time += (frameData.delta || 0) / 1000;
      }

      liveUniforms.time.value = time;
      liveUniforms.delta.value = frameData?.delta ?? 0;
      liveUniforms.volume.value = frameData?.volume ?? 0;

      const props = effect.properties || {};
      for (const [name, def] of Object.entries(uniformDefs)) {
        const uniform = liveUniforms[name];
        if (uniform !== undefined) {
          applyUniform(uniform, def, props);
        }
      }
    };

    pass.__updateScenePass(null);

    return pass;
  };
}
