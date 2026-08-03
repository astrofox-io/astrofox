// @ts-nocheck
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  NearestFilter,
  SRGBColorSpace,
} from 'three';
import ShaderPass from '../../composer/ShaderPass';

const ASCII_CHARSET = ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
const ATLAS_CHAR_COUNT = 256;

const ASCII_SHADER = {
  uniforms: {
    inputTexture: { type: 't', value: null },
    tAscii: { type: 't', value: null },
    resolution: { type: 'v2', value: [1, 1] },
    cellSize: { type: 'f', value: 16 },
    fontScale: { type: 'f', value: 1 },
    invert: { type: 'f', value: 0 },
  },
  vertexShader: `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  fragmentShader: `
varying vec2 vUv;
uniform vec2 resolution;
uniform sampler2D inputTexture;
uniform sampler2D tAscii;
uniform float cellSize;
uniform float fontScale;
uniform float invert;

const vec2 baseFontSize = vec2(8.0, 16.0);
const float atlasCharCount = 256.0;

vec4 lookupASCII(float asciiValue, vec2 localPos, vec2 fontSize) {
	vec2 pos = mod(localPos, fontSize.xy);
	pos.x = pos.x / (fontSize.x * atlasCharCount) + asciiValue;
	pos.y = pos.y / fontSize.y;
	return texture2D(tAscii, pos);
}

void main(void) {
	vec2 fontSize = max(baseFontSize * max(fontScale, 0.25), vec2(1.0));
	vec2 cell = vec2(max(cellSize, 1.0), max(cellSize * 2.0, 1.0));
	vec2 invViewport = vec2(1.0) / resolution;
	vec2 uvClamped = vUv - mod(vUv, cell * invViewport);
	vec2 sampleUv = uvClamped + cell * 0.5 * invViewport;
	vec4 averageColor = texture2D(inputTexture, sampleUv);
	float brightness = dot(averageColor.rgb, vec3(0.33333));

	if (invert > 0.5) {
		brightness = 1.0 - brightness;
	}

	vec4 clampedColor = floor(averageColor * 8.0) / 8.0;
	float asciiChar = floor((1.0 - brightness) * 255.0) / 256.0;

	vec2 localPos = vec2(
		(gl_FragCoord.x - floor(gl_FragCoord.x / cell.x) * cell.x) * (fontSize.x / cell.x),
		(gl_FragCoord.y - floor(gl_FragCoord.y / cell.y) * cell.y) * (fontSize.y / cell.y)
	);

	vec4 glyph = lookupASCII(asciiChar, localPos, fontSize);
	gl_FragColor = clampedColor * glyph;
}
`,
};

function buildGlyphAtlas(fontSize = 54) {
  const glyphWidth = Math.max(8, Math.round(fontSize * 0.5));
  const glyphHeight = Math.max(16, Math.round(fontSize));
  const canvas = document.createElement('canvas');
  canvas.width = glyphWidth * ATLAS_CHAR_COUNT;
  canvas.height = glyphHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `${Math.max(fontSize, 8)}px monospace`;

  for (let index = 0; index < ATLAS_CHAR_COUNT; index += 1) {
    const characterIndex = Math.floor(
      (index / Math.max(ATLAS_CHAR_COUNT - 1, 1)) * (ASCII_CHARSET.length - 1),
    );
    const character = ASCII_CHARSET[characterIndex] || ' ';
    const x = index * glyphWidth + glyphWidth / 2;
    const y = glyphHeight / 2;
    context.fillText(character, x, y);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData = {
    glyphWidth,
    glyphHeight,
    fontSize,
  };
  return texture;
}

export default class AsciiPass extends ShaderPass {
  constructor({ cellSize = 16, fontSize = 54, invert = false } = {}) {
    super(ASCII_SHADER);
    this.atlasTexture = null;
    this.updateOptions({ cellSize, fontSize, invert });
  }

  updateOptions({ cellSize = 16, fontSize = 54, invert = false } = {}) {
    const nextFontSize = Math.max(Number(fontSize || 54), 8);
    if (!this.atlasTexture || this.atlasTexture.userData?.fontSize !== nextFontSize) {
      this.atlasTexture?.dispose?.();
      this.atlasTexture = buildGlyphAtlas(nextFontSize);
    }

    const glyphWidth = this.atlasTexture?.userData?.glyphWidth ?? 8;
    const glyphHeight = this.atlasTexture?.userData?.glyphHeight ?? 16;
    this.setUniforms({
      tAscii: this.atlasTexture,
      cellSize: Number(cellSize ?? 16),
      fontScale: glyphWidth / 8,
      invert: invert ? 1 : 0,
      resolution: [this.width || 1, this.height || 1],
    });

    this.cellAspect = glyphHeight / glyphWidth;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    super.setSize(width, height);
    this.setUniforms({
      resolution: [width, height],
    });
  }

  dispose() {
    this.atlasTexture?.dispose?.();
    super.dispose();
  }
}
