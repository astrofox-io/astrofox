import { z } from 'zod';

const id = z.string().min(1).max(200);
const properties = z.record(z.string().min(1).max(100), z.json());
const filePath = z.string().min(1).max(4096).describe('Absolute local filesystem path.');
const empty = z.object({}).strict();

export const commands = {
  get_project: {
    description:
      'Inspect the live project, canvas, scenes, reactors and audio. Embedded media is omitted.',
    schema: empty,
    readOnly: true,
  },
  list_element_types: {
    description: 'List installed displays and effects, plus Scene and AudioReactor.',
    schema: empty,
    readOnly: true,
  },
  describe_element_type: {
    description:
      'Get defaults and resolved editable controls. Supply elementId for current, context-dependent bounds.',
    schema: z.object({ name: id, elementId: id.optional() }).strict(),
    readOnly: true,
  },
  new_project: {
    description:
      'Replace the current project with a new project. Set discardChanges only when discarding unsaved edits is intended.',
    schema: z.object({ discardChanges: z.boolean().default(false) }).strict(),
  },
  create_scene: {
    description: 'Add a scene and return its ID.',
    schema: z.object({ name: z.string().min(1).max(200).optional() }).strict(),
  },
  add_element: {
    description: 'Add a display or effect by its exact installed type name to an existing scene.',
    schema: z.object({ sceneId: id, type: id, properties: properties.default({}) }).strict(),
  },
  update_element: {
    description:
      'Update an existing scene, display or effect. Unknown properties and invalid values are rejected.',
    schema: z
      .object({
        id,
        properties: properties.default({}),
        name: z.string().min(1).max(200).optional(),
        enabled: z.boolean().optional(),
      })
      .strict(),
  },
  remove_element: {
    description: 'Remove a scene (including its contents), display or effect.',
    schema: z.object({ id }).strict(),
  },
  reorder_element: {
    description:
      'Move an element to a target element position, or into a target scene. Types must be compatible.',
    schema: z.object({ id, targetId: id }).strict(),
  },
  configure_canvas: {
    description: 'Set canvas dimensions and background color.',
    schema: z
      .object({
        width: z.number().int().min(16).max(7680),
        height: z.number().int().min(16).max(7680),
        backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .strict(),
  },
  create_reactor: {
    description: 'Create an audio reactor with validated properties.',
    schema: z.object({ properties: properties.default({}) }).strict(),
  },
  update_reactor: {
    description: 'Update an audio reactor by ID.',
    schema: z.object({ id, properties }).strict(),
  },
  remove_reactor: {
    description: 'Remove a reactor and its bindings.',
    schema: z.object({ id }).strict(),
  },
  bind_reactor: {
    description:
      'Bind a reactor to a supported numeric element property, or unbind it with reactorId=null.',
    schema: z
      .object({
        elementId: id,
        property: id,
        reactorId: id.nullable(),
        min: z.number().finite().default(0),
        max: z.number().finite().default(1),
      })
      .strict(),
  },
  get_preview: {
    description:
      'Capture the current composition as a PNG, scaled to maxSize. This is a live preview, not a deterministic time render.',
    schema: z.object({ maxSize: z.number().int().min(64).max(2048).default(1024) }).strict(),
    readOnly: true,
  },
  open_project: {
    description:
      'Open a local .afx/.json project, including legacy gzip .afx. Reports missing media/plugins without dialogs.',
    schema: z.object({ path: filePath, discardChanges: z.boolean().default(false) }).strict(),
  },
  save_project: {
    description:
      'Save the current project to an absolute .afx path. Existing files require overwrite=true.',
    schema: z.object({ path: filePath, overwrite: z.boolean().default(false) }).strict(),
  },
  load_media: {
    description:
      'Load a local audio file, or assign a local image/video to a compatible element. Loading audio does not start playback.',
    schema: z
      .object({
        path: filePath,
        kind: z.enum(['audio', 'image', 'video']),
        elementId: id.optional(),
      })
      .strict(),
  },
  playback: {
    description: 'Play, pause or seek loaded audio. Seek position is a fraction from 0 to 1.',
    schema: z
      .object({
        action: z.enum(['play', 'pause', 'seek']),
        position: z.number().min(0).max(1).optional(),
      })
      .strict(),
  },
  start_export: {
    description:
      'Start an offline video export and immediately return a job ID. Requires loaded audio for duration/analysis. Other MCP edits are blocked until completion.',
    schema: z
      .object({
        path: filePath,
        overwrite: z.boolean().default(false),
        startTime: z.number().min(0).default(0),
        endTime: z.number().positive().optional(),
        fps: z.union([z.literal(30), z.literal(60)]).default(30),
        encoder: z.enum(['x264', 'x265', 'nvenc', 'webm']).default('x264'),
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
        includeAudio: z.boolean().default(true),
      })
      .strict(),
  },
  get_export_status: {
    description: 'Read a video export job. Jobs are retained until renderer reload (up to 50).',
    schema: z.object({ jobId: id }).strict(),
    readOnly: true,
  },
  cancel_export: {
    description: 'Cancel an export job and clean up its ffmpeg processes.',
    schema: z.object({ jobId: id }).strict(),
  },
} as const;

export type CommandName = keyof typeof commands;
export type CommandArgs<K extends CommandName> = z.infer<(typeof commands)[K]['schema']>;
export interface AutomationRequest {
  id: string;
  command: CommandName;
  args: unknown;
  deadline: number;
}
export interface AutomationResponse {
  id: string;
  result?: unknown;
  error?: string;
}
