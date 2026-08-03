import type { RenderFrameData } from '@/lib/types';

/**
 * Render pipeline contract used by the app-level renderer loop.
 */
export default class RenderBackend {
  /**
   * Called once after the stage viewport is mounted.
   */
  init(_params: {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    backgroundColor: string;
  }): void {
    throw new Error(`RenderBackend.init is not implemented for ${this.constructor.name}`);
  }

  /**
   * Apply stage property updates (size, background color, zoom metadata, etc).
   */
  update(_properties: Record<string, unknown>): boolean {
    throw new Error(`RenderBackend.update is not implemented for ${this.constructor.name}`);
  }

  /**
   * Render one interactive frame.
   */
  render(_frameData: RenderFrameData): void {
    throw new Error(`RenderBackend.render is not implemented for ${this.constructor.name}`);
  }

  /**
   * Render one deterministic export frame and return RGBA pixels.
   */
  async renderExportFrame(_params: Record<string, unknown>): Promise<Uint8Array> {
    throw new Error(
      `RenderBackend.renderExportFrame is not implemented for ${this.constructor.name}`,
    );
  }

  /**
   * Get the active rendering canvas.
   */
  getCanvas(): HTMLCanvasElement | null {
    throw new Error(`RenderBackend.getCanvas is not implemented for ${this.constructor.name}`);
  }

  /**
   * Get current stage size in pixels.
   */
  getSize(): { width: number; height: number } {
    throw new Error(`RenderBackend.getSize is not implemented for ${this.constructor.name}`);
  }

  /**
   * Read current output RGBA pixels.
   */
  getPixels(): Uint8Array {
    throw new Error(`RenderBackend.getPixels is not implemented for ${this.constructor.name}`);
  }

  /**
   * Encode current output as an image buffer.
   */
  getImage(_format = 'image/png'): Uint8Array {
    throw new Error(`RenderBackend.getImage is not implemented for ${this.constructor.name}`);
  }

  /**
   * Cleanup resources.
   */
  dispose() {}
}
