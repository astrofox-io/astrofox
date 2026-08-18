import fs from 'node:fs';
import path from 'node:path';

interface LoaderContext {
  resourcePath: string;
}

const INCLUDE_PATTERN = /^[ \t]*#include\s+["'](.+?)["'][ \t]*$/gm;

function resolveIncludes(source: string, resourcePath: string, seen: Set<string>): string {
  return source.replace(INCLUDE_PATTERN, (_match, includePath: string) => {
    const includeFilePath = path.resolve(path.dirname(resourcePath), includePath);
    const includeKey = includeFilePath.toLowerCase();

    if (seen.has(includeKey)) {
      return '';
    }

    seen.add(includeKey);
    const includeSource = fs.readFileSync(includeFilePath, 'utf8');
    return resolveIncludes(includeSource, includeFilePath, seen);
  });
}

export default function glslLoader(this: LoaderContext, source: string | Buffer): string {
  const sourceText = Buffer.isBuffer(source) ? source.toString('utf8') : source;
  const seen = new Set([this.resourcePath.toLowerCase()]);
  const resolvedSource = resolveIncludes(sourceText, this.resourcePath, seen);

  return `export default ${JSON.stringify(resolvedSource)};`;
}
