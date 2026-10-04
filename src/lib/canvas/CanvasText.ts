import { resolveCanvasFontFamily } from '@/app/fontFamilies';
import Entity from '@/lib/core/Entity';
import type { CanvasContext, CanvasElement } from '@/lib/types';
import { resetCanvas } from '@/lib/utils/canvas';

// Supersample glyphs so font hinting at fractional sizes stays below a stage pixel.
export const TEXT_PIXEL_RATIO = 2;

export default class CanvasText extends Entity {
  readonly pixelRatio = TEXT_PIXEL_RATIO;
  canvas: CanvasElement;
  context: CanvasContext;
  loadingFonts: Set<string>;
  version = 0;
  onFontLoad?: () => void;
  private renderedText?: { text: unknown; font: string; color: unknown };

  static defaultProperties = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    color: '#FFFFFF',
  };

  constructor(properties: Record<string, unknown>, canvas: CanvasElement) {
    super('CanvasText', { ...CanvasText.defaultProperties, ...properties });

    this.canvas = canvas;
    this.context = this.canvas.getContext('2d') as CanvasContext;
    this.loadingFonts = new Set();
  }

  normalizeFontFamily(font: string) {
    if (font === 'Chunkfive') {
      return 'Bevan';
    }
    if (font === 'Intro') {
      return 'Exo 2';
    }
    return resolveCanvasFontFamily(font);
  }

  getFont() {
    const { italic, bold, size, font } = this.properties as Record<string, unknown>;
    const fontFamily = this.normalizeFontFamily(font as string);

    return [
      italic ? 'italic' : 'normal',
      bold ? 'bold' : 'normal',
      `${Number(size) * this.pixelRatio}px`,
      fontFamily,
    ].join(' ');
  }

  loadFontIfNeeded(font: string, text: string) {
    if (!document.fonts) {
      return;
    }

    if (document.fonts.check(font, text || ' ')) {
      return;
    }

    const key = `${font}\0${text}`;
    if (this.loadingFonts.has(key)) {
      return;
    }

    this.loadingFonts.add(key);

    document.fonts
      .load(font, text || ' ')
      .then(() => {
        if (this.getFont() === font && this.properties.text === text) {
          this.render(true);
          this.onFontLoad?.();
        }
      })
      .catch(() => {})
      .finally(() => {
        this.loadingFonts.delete(key);
      });
  }

  render(force = false) {
    const { canvas, context } = this;
    const { text, size, color } = this.properties as Record<string, unknown>;
    const font = this.getFont();

    if (
      !force &&
      this.renderedText &&
      this.renderedText.text === text &&
      this.renderedText.font === font &&
      this.renderedText.color === color
    ) {
      return;
    }

    this.loadFontIfNeeded(font, text as string);

    context.font = font;

    const length = Math.ceil(context.measureText(text as string).width);
    const spacing = (text as string).length ? Math.ceil(length / (text as string).length) : 0;
    const width = Math.max(1, length + spacing);
    const height = Math.max(1, Math.ceil((size as number) * 2 * this.pixelRatio));

    // Reset canvas
    resetCanvas(canvas, width, height);

    // Draw text
    context.font = font;
    context.fillStyle = color as string;
    context.textAlign = 'center';
    // The middle baseline uses font metrics that jump as animated sizes change.
    // Centre the glyph bounds around the actual integer-sized canvas instead.
    context.textBaseline = 'alphabetic';
    const metrics = context.measureText(text as string);
    const baseline =
      canvas.height / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    context.fillText(text as string, canvas.width / 2, baseline);
    this.renderedText = { text, font, color };
    this.version += 1;
  }
}
