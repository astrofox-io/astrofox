import { z } from 'zod';
import { CANVAS_LIMITS } from '../document/rules';
import { MAX_PROJECT_DURATION, MIN_PROJECT_DURATION } from '../timeline/settings';
import { EASINGS, MAX_KEYFRAMES } from '../timeline/tracks';
import { REACTOR_MODES } from '../types';
import { assertSafe } from '../utils/object';

const id = z.string().min(1).max(200);
const properties = z.record(z.string().min(1).max(100), z.json());
const filePath = z.string().min(1).max(4096).describe('Absolute local filesystem path.');
const empty = z.object({}).strict();
const seconds = z.number().min(0).describe('Seconds from the project start.');
const fps = z.union([z.literal(30), z.literal(60)]);

/**
 * What running a command does to the project:
 * - `read` leaves it unchanged
 * - `edit` changes it in a way undo or another edit can reverse
 * - `destructive` can lose unsaved work or overwrite a file
 */
export type CommandEffect = 'read' | 'edit' | 'destructive';

/** One MCP tool: everything the server, the editor and the docs know about it. */
export interface CommandDefinition {
  description: string;
  /** The arguments, checked in the editor before the command runs. */
  schema: z.ZodType;
  effect: CommandEffect;
  /** Whether it may run while a video export is rendering: reads that do not draw, and cancelling. */
  duringExport?: boolean;
  /** `image` results are an `ImageResult`, sent to the client as an image. Others are JSON. */
  result?: 'json' | 'image';
}

/** The result of a command whose `result` is `image`. */
export interface ImageResult {
  /** Base64, without a data URL prefix. */
  data: string;
  mimeType: string;
  width: number;
  height: number;
}

export const commands = {
  get_project: {
    description:
      'Inspect the live project, canvas, scenes, reactors and audio. Embedded media is omitted.',
    schema: empty,
    effect: 'read',
    duringExport: true,
  },
  list_element_types: {
    description: 'List installed displays and effects, plus Scene and AudioReactor.',
    schema: empty,
    effect: 'read',
    duringExport: true,
  },
  describe_element_type: {
    description:
      'Get defaults and resolved editable controls. Supply elementId for current, context-dependent bounds.',
    schema: z.object({ name: id, elementId: id.optional() }).strict(),
    effect: 'read',
    duringExport: true,
  },
  new_project: {
    description:
      'Replace the current project with a new project. Set discardChanges only when discarding unsaved edits is intended.',
    schema: z.object({ discardChanges: z.boolean().default(false) }).strict(),
    effect: 'destructive',
  },
  create_scene: {
    description: 'Add a scene and return its ID.',
    schema: z.object({ name: z.string().min(1).max(200).optional() }).strict(),
    effect: 'edit',
  },
  add_element: {
    description: 'Add a display or effect by its exact installed type name to an existing scene.',
    schema: z.object({ sceneId: id, type: id, properties: properties.default({}) }).strict(),
    effect: 'edit',
  },
  update_element: {
    description:
      'Update an existing scene, display or effect. Unknown properties and invalid values are rejected, and so are animated properties: change those with set_keyframes, or remove their keys with clear_keyframes first.',
    schema: z
      .object({
        id,
        properties: properties.default({}),
        name: z.string().min(1).max(200).optional(),
        enabled: z.boolean().optional(),
      })
      .strict(),
    effect: 'edit',
  },
  remove_element: {
    description: 'Remove a scene (including its contents), display or effect.',
    schema: z.object({ id }).strict(),
    effect: 'destructive',
  },
  reorder_element: {
    description:
      'Move an element to a target element position, or into a target scene. Types must be compatible.',
    schema: z.object({ id, targetId: id }).strict(),
    effect: 'edit',
  },
  configure_canvas: {
    description: 'Set canvas dimensions and background color.',
    schema: z
      .object({
        width: z.number().int().min(CANVAS_LIMITS.minSize).max(CANVAS_LIMITS.maxSize),
        height: z.number().int().min(CANVAS_LIMITS.minSize).max(CANVAS_LIMITS.maxSize),
        backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
      .strict(),
    effect: 'edit',
  },
  create_reactor: {
    description: 'Create an audio reactor with validated properties.',
    schema: z.object({ properties: properties.default({}) }).strict(),
    effect: 'edit',
  },
  update_reactor: {
    description: 'Update an audio reactor by ID.',
    schema: z.object({ id, properties }).strict(),
    effect: 'edit',
  },
  remove_reactor: {
    description: 'Remove a reactor and its bindings.',
    schema: z.object({ id }).strict(),
    effect: 'destructive',
  },
  bind_reactor: {
    description:
      'Bind a reactor to a supported numeric element property, or unbind it with reactorId=null. The output (0-1) is scaled to min..max, then: replace (default) sets the property to it; add adds it to the property value (authored or keyframed); multiply scales the value by it, e.g. min 0, max 1 to pulse an animated opacity. In replace mode min and max must be within the property bounds.',
    schema: z
      .object({
        elementId: id,
        property: id,
        reactorId: id.nullable(),
        min: z.number().finite().default(0),
        max: z.number().finite().default(1),
        mode: z.enum(REACTOR_MODES).default('replace'),
      })
      .strict(),
    effect: 'edit',
  },
  get_preview: {
    description:
      'Capture the composition as a PNG scaled to maxSize. With time (seconds), renders that exact project time deterministically (clips, fades, reactors from the audio at that time); without it, captures the live view.',
    schema: z
      .object({
        maxSize: z.number().int().min(64).max(2048).default(1024),
        time: seconds.optional(),
      })
      .strict(),
    effect: 'read',
    result: 'image',
  },
  get_timeline: {
    description:
      'Read the project transport (time, duration, fps) and every element with its timeline clip and keyframe tracks. Elements without a clip are active for the whole project.',
    schema: empty,
    effect: 'read',
    duringExport: true,
  },
  set_timeline: {
    description:
      'Set the project duration in seconds (null follows the loaded audio) and/or the frame rate used for frame snapping, the one-frame minimum clip length and export.',
    schema: z
      .object({
        duration: z
          .number()
          .min(MIN_PROJECT_DURATION)
          .max(MAX_PROJECT_DURATION)
          .nullable()
          .optional(),
        fps: fps.optional(),
      })
      .strict(),
    effect: 'edit',
  },
  set_clips: {
    description:
      'Set when elements are active. Each clip is merged into the existing one: start/end in seconds (end null = until the project ends), optional fadeIn/fadeOut in seconds applied to opacity. Omitted fields are kept; null resets them. A clip must be at least one frame long at the project fps; times are not snapped to frames.',
    schema: z
      .object({
        clips: z
          .array(
            z
              .object({
                id,
                start: seconds.nullable().optional(),
                end: seconds.nullable().optional(),
                fadeIn: seconds.nullable().optional(),
                fadeOut: seconds.nullable().optional(),
              })
              .strict(),
          )
          .min(1)
          .max(500),
      })
      .strict(),
    effect: 'edit',
  },
  clear_clips: {
    description: 'Remove timeline clips so the elements are active for the whole project.',
    schema: z.object({ ids: z.array(id).min(1).max(500) }).strict(),
    effect: 'edit',
  },
  set_keyframes: {
    description:
      'Animate element properties over project time. Each track sets keys for one property: time in absolute project seconds, value in the property type (number, or #rrggbb for colors), and the easing toward the next key (default linear; hold keeps the value until the next key). Before the first key the property holds the first value; after the last, the last. mode replace (default) replaces the property keys; merge sets keys at the given times and keeps the rest. Number and color controls can be animated (describe_element_type lists them under animatable); values must be within the control bounds, except unbounded controls such as rotation, whose keys may hold any number of turns. Reactor bindings apply on top of keys in their mode.',
    schema: z
      .object({
        tracks: z
          .array(
            z
              .object({
                id,
                property: id,
                keyframes: z
                  .array(
                    z
                      .object({
                        time: seconds,
                        value: z.union([z.number().finite(), z.string().max(32)]),
                        easing: z.enum(EASINGS).optional(),
                      })
                      .strict(),
                  )
                  .min(1)
                  .max(MAX_KEYFRAMES),
                mode: z.enum(['replace', 'merge']).default('replace'),
              })
              .strict(),
          )
          .min(1)
          .max(500),
      })
      .strict(),
    effect: 'edit',
  },
  clear_keyframes: {
    description:
      'Remove keyframes so properties return to their static values. Omit properties to clear every track of the element.',
    schema: z.object({ id, properties: z.array(id).min(1).max(200).optional() }).strict(),
    effect: 'edit',
  },
  open_project: {
    description:
      'Open a local .afx/.json project, including legacy gzip .afx. Reports missing media/plugins without dialogs.',
    schema: z.object({ path: filePath, discardChanges: z.boolean().default(false) }).strict(),
    effect: 'destructive',
  },
  save_project: {
    description:
      'Save the current project to an absolute .afx path. Existing files require overwrite=true.',
    schema: z.object({ path: filePath, overwrite: z.boolean().default(false) }).strict(),
    effect: 'destructive',
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
    effect: 'edit',
  },
  playback: {
    description:
      'Play, pause, stop or seek the project transport (works without audio), and/or set loop. Seek with time in seconds, or position as a 0-1 fraction of the project duration. With loop, playback starts again from zero at the project end instead of stopping. Supply action, loop or both.',
    schema: z
      .object({
        action: z.enum(['play', 'pause', 'stop', 'seek']).optional(),
        loop: z.boolean().optional(),
        time: seconds.optional(),
        position: z.number().min(0).max(1).optional(),
      })
      .strict(),
    effect: 'edit',
  },
  start_export: {
    description:
      'Start an offline video export of the project timeline and immediately return a job ID. Times are seconds within the project duration; fps defaults to the project frame rate; audio is required only when includeAudio is true. Other MCP edits are blocked until completion.',
    schema: z
      .object({
        path: filePath,
        overwrite: z.boolean().default(false),
        startTime: z.number().min(0).default(0),
        endTime: z.number().positive().optional(),
        // Defaults to the project frame rate.
        fps: fps.optional(),
        encoder: z.enum(['x264', 'x265', 'nvenc', 'webm']).default('x264'),
        quality: z.enum(['low', 'medium', 'high']).default('medium'),
        includeAudio: z.boolean().default(true),
      })
      .strict(),
    effect: 'destructive',
  },
  get_export_status: {
    description: 'Read a video export job. Jobs are retained until renderer reload (up to 50).',
    schema: z.object({ jobId: id }).strict(),
    effect: 'read',
    duringExport: true,
  },
  cancel_export: {
    description: 'Cancel an export job and clean up its ffmpeg processes.',
    schema: z.object({ jobId: id }).strict(),
    effect: 'edit',
    duringExport: true,
  },
} satisfies Record<string, CommandDefinition>;

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

function definition(name: CommandName): CommandDefinition {
  return commands[name];
}

/** The MCP tool hints for a command. */
export function toolAnnotations(name: CommandName) {
  const { effect } = definition(name);
  return {
    readOnlyHint: effect === 'read',
    destructiveHint: effect === 'destructive',
    openWorldHint: false,
  };
}

/** A command's result as MCP tool content. */
export function toolContent(name: CommandName, result: unknown) {
  if (definition(name).result === 'image') {
    const image = result as ImageResult;
    return [
      { type: 'image' as const, data: image.data, mimeType: image.mimeType },
      { type: 'text' as const, text: `${image.width} × ${image.height}` },
    ];
  }

  return [{ type: 'text' as const, text: JSON.stringify(result) }];
}

/**
 * Check a request from a client before it runs: the command exists, it may run
 * now, and its arguments are safe and match its schema (defaults filled in).
 */
export function parseCommand(
  command: string,
  args: unknown,
  state: { exporting: boolean },
): { name: CommandName; args: unknown } {
  if (!Object.hasOwn(commands, command)) throw new Error('Unknown automation command.');
  const name = command as CommandName;
  if (state.exporting && !definition(name).duringExport)
    throw new Error('Wait for the current export to finish, or cancel it.');
  assertSafe(args);
  return { name, args: definition(name).schema.parse(args) };
}
