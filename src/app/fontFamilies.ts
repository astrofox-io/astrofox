export function normalizeFontName(fontName: string) {
  if (fontName === 'Chunkfive') return 'Bevan';
  if (fontName === 'Intro') return 'Exo 2';
  return fontName;
}

export function resolveFontFamily(fontName: string) {
  const name = normalizeFontName(fontName);
  const fallback = 'var(--font-inter), sans-serif';
  return name === 'Inter' ? fallback : `${JSON.stringify(name)}, ${fallback}`;
}

export function resolveCanvasFontFamily(fontName: string) {
  // Canvas cannot resolve CSS variables. Next gives Inter a generated family.
  const inter =
    typeof document === 'undefined'
      ? '"Inter"'
      : getComputedStyle(document.body).getPropertyValue('--font-inter').trim() || '"Inter"';
  const name = normalizeFontName(fontName);
  return name === 'Inter'
    ? `${inter}, sans-serif`
    : `${JSON.stringify(name)}, ${inter}, sans-serif`;
}
