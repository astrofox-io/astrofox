import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { type CommandName, commands, parseCommand, toolAnnotations, toolContent } from './protocol';

const names = Object.keys(commands) as CommandName[];

describe('parseCommand', () => {
  it('fills in defaults from the schema', () => {
    expect(parseCommand('new_project', {}, { exporting: false })).toEqual({
      name: 'new_project',
      args: { discardChanges: false },
    });
  });

  it('refuses a command that does not exist', () => {
    expect(() => parseCommand('format_disk', {}, { exporting: false })).toThrow(
      'Unknown automation command.',
    );
    expect(() => parseCommand('toString', {}, { exporting: false })).toThrow(
      'Unknown automation command.',
    );
  });

  it('refuses arguments the schema does not allow', () => {
    expect(() =>
      parseCommand('remove_element', { id: 'a', extra: 1 }, { exporting: false }),
    ).toThrow();
  });

  it('refuses prototype keys and non-finite numbers anywhere in the arguments', () => {
    const polluted = JSON.parse('{"id":"a","properties":{"__proto__":{"x":1}}}');

    expect(() => parseCommand('update_element', polluted, { exporting: false })).toThrow(
      'Forbidden property: __proto__',
    );
    expect(() =>
      parseCommand(
        'update_element',
        { id: 'a', properties: { x: Infinity } },
        { exporting: false },
      ),
    ).toThrow('Numbers must be finite.');
  });

  it('lets only reads that do not draw, and cancelling, run during an export', () => {
    const allowed = names.filter(name => {
      try {
        parseCommand(name, { jobId: 'job' }, { exporting: true });
        return true;
      } catch (error) {
        return !String(error).includes('Wait for the current export');
      }
    });

    expect(allowed.sort()).toEqual(
      [
        'cancel_export',
        'describe_element_type',
        'get_export_status',
        'get_project',
        'get_timeline',
        'list_element_types',
      ].sort(),
    );
  });
});

describe('toolAnnotations', () => {
  it('marks reads read-only, and only destructive commands destructive', () => {
    expect(toolAnnotations('get_project')).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    });
    expect(toolAnnotations('update_element')).toMatchObject({
      readOnlyHint: false,
      destructiveHint: false,
    });
    expect(toolAnnotations('save_project')).toMatchObject({
      readOnlyHint: false,
      destructiveHint: true,
    });
  });

  it('never marks a command that can run during an export as destructive', () => {
    for (const name of names) {
      if ((commands[name] as { duringExport?: boolean }).duringExport) {
        expect(toolAnnotations(name).destructiveHint, name).toBe(false);
      }
    }
  });
});

describe('toolContent', () => {
  it('sends JSON results as text', () => {
    expect(toolContent('get_timeline', { time: 1 })).toEqual([
      { type: 'text', text: '{"time":1}' },
    ]);
  });

  it('sends image results as an image with its size', () => {
    expect(
      toolContent('get_preview', { data: 'AAAA', mimeType: 'image/png', width: 64, height: 32 }),
    ).toEqual([
      { type: 'image', data: 'AAAA', mimeType: 'image/png' },
      { type: 'text', text: '64 × 32' },
    ]);
  });
});

describe('docs/mcp.md', () => {
  const docs = readFileSync(
    fileURLToPath(new URL('../../../docs/mcp.md', import.meta.url)),
    'utf8',
  );
  const table = docs.slice(
    docs.indexOf('## Tools'),
    docs.indexOf('\n## ', docs.indexOf('## Tools') + 1),
  );
  const documented = new Set(
    [...table.matchAll(/^\|(.+?)\|/gm)].flatMap(([, cell]) =>
      [...cell.matchAll(/`([a-z_]+)`/g)].map(([, name]) => name),
    ),
  );

  it('lists every tool, and no tool that does not exist', () => {
    expect([...documented].sort()).toEqual([...names].sort());
  });
});
