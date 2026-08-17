import { z } from 'zod';
import { KNOWN_LIBRARIES } from './libraries';
import type { PluginManifest } from './types';

// Control types plugin manifests may use. Media inputs (image/video) are
// excluded until asset transfer to plugin runtimes is supported.
export const ALLOWED_CONTROL_TYPES = new Set([
  'text',
  'number',
  'toggle',
  'checkbox',
  'color',
  'colorrange',
  'range',
  'select',
  'time',
]);

export const KNOWN_PERMISSIONS = new Set(['network']);

const namePattern = /^@[a-z0-9][a-z0-9-_.]*\/[a-z0-9][a-z0-9-_.]*$/;

const uniformSchema = z.object({
  type: z.enum(['float', 'int', 'vec2', 'vec3', 'vec4', 'color']),
  from: z.union([z.string().min(1), z.array(z.string().min(1)).min(1).max(4)]),
});

const fftSchema = z.object({
  bins: z.number().int().min(1).max(512).default(64),
  minFrequency: z.number().min(0).max(22050).default(0),
  maxFrequency: z.number().min(0).max(22050).default(6000),
  smoothing: z.number().min(0).max(0.99).default(0.5),
  minDecibels: z.number().min(-100).max(0).default(-100),
  maxDecibels: z.number().min(-100).max(0).default(-12),
});

const tdSchema = z.object({
  samples: z.number().int().min(16).max(4096).default(256),
});

export const manifestSchema = z
  .object({
    api: z.literal(1),
    // Namespaced "@author/name" ids only, so external plugins can never
    // collide with core display/effect names.
    name: z.string().min(3).max(100).regex(namePattern, {
      message: 'Plugin name must look like "@author/plugin-name"',
    }),
    version: z.string().min(1).max(32),
    label: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    author: z.string().max(100).optional(),
    homepage: z.string().max(500).optional(),
    type: z.enum(['display', 'effect']),
    runtime: z.enum(['shader', 'worker']),
    entry: z.string().max(500).optional(),
    shader: z.string().max(500).optional(),
    icon: z.string().max(500).optional(),
    permissions: z.array(z.string().max(50)).max(10).default([]),
    // Host-provided libraries handed to worker plugins (see libraries.ts).
    libraries: z.array(z.string().max(50)).max(10).default([]),
    // Worker displays that own a 3D camera: the host adds the standard camera
    // properties/controls and lets the user orbit them from the stage.
    camera: z.boolean().default(false),
    audio: z
      .object({
        fft: fftSchema.optional(),
        td: tdSchema.optional(),
      })
      .optional(),
    defaultProperties: z.record(z.string().max(100), z.unknown()).default({}),
    controls: z.record(z.string().max(100), z.record(z.string().max(100), z.unknown())).default({}),
    uniforms: z.record(z.string().max(100), uniformSchema).optional(),
  })
  .superRefine((manifest, ctx) => {
    if (manifest.runtime === 'shader' && !manifest.shader) {
      ctx.addIssue({
        code: 'custom',
        path: ['shader'],
        message: 'runtime "shader" requires a "shader" file reference',
      });
    }

    if (manifest.runtime === 'worker' && !manifest.entry) {
      ctx.addIssue({
        code: 'custom',
        path: ['entry'],
        message: 'runtime "worker" requires an "entry" file reference',
      });
    }

    for (const [key, control] of Object.entries(manifest.controls)) {
      const type = (control as { type?: unknown }).type;
      if (typeof type !== 'string' || !ALLOWED_CONTROL_TYPES.has(type)) {
        ctx.addIssue({
          code: 'custom',
          path: ['controls', key, 'type'],
          message: `Unsupported control type: ${String(type)}`,
        });
      }
    }

    for (const library of manifest.libraries) {
      if (!KNOWN_LIBRARIES.has(library)) {
        ctx.addIssue({
          code: 'custom',
          path: ['libraries'],
          message: `Unknown library: ${library}`,
        });
      }
    }

    if (manifest.camera && (manifest.type !== 'display' || manifest.runtime !== 'worker')) {
      ctx.addIssue({
        code: 'custom',
        path: ['camera'],
        message: 'Only worker-runtime displays can declare a camera',
      });
    }

    if (manifest.libraries.length > 0 && manifest.runtime !== 'worker') {
      ctx.addIssue({
        code: 'custom',
        path: ['libraries'],
        message: 'Only worker-runtime plugins can request libraries',
      });
    }

    for (const permission of manifest.permissions) {
      if (!KNOWN_PERMISSIONS.has(permission)) {
        ctx.addIssue({
          code: 'custom',
          path: ['permissions'],
          message: `Unknown permission: ${permission}`,
        });
      }
    }
  });

export function parseManifest(data: unknown): PluginManifest {
  return manifestSchema.parse(data) as PluginManifest;
}
