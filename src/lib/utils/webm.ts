/**
 * Post-processing for WebM files produced by `MediaRecorder`.
 *
 * Browsers stream the recording, so the resulting file is left in an
 * "unfinished" state: the Segment and every Cluster have unknown sizes and the
 * Segment Info either has no Duration (Chrome) or a Duration of 0 (Firefox).
 * Browsers cope with this, but many desktop players (PotPlayer, Windows Media
 * Player, ...) treat such files as empty and show black video with no sound.
 *
 * `finalizeWebm` patches the container in place: it writes the real Segment and
 * Cluster sizes and stores the recorded duration in Segment Info. No media data
 * is touched, so this is cheap even for large recordings.
 */

const ID_EBML = 0x1a45dfa3;
const ID_SEGMENT = 0x18538067;
const ID_INFO = 0x1549a966;
const ID_TIMECODE_SCALE = 0x2ad7b1;
const ID_DURATION = 0x4489;
const ID_CLUSTER = 0x1f43b675;
const ID_CLUSTER_TIMECODE = 0xe7;
const ID_SIMPLE_BLOCK = 0xa3;
const ID_BLOCK_GROUP = 0xa0;
const ID_BLOCK = 0xa1;

const DEFAULT_TIMECODE_SCALE = 1_000_000; // nanoseconds per timecode unit (1ms)

interface Vint {
  value: number;
  length: number;
  unknown: boolean;
}

interface Element {
  id: number;
  idLength: number;
  size: Vint;
  /** Offset of the first payload byte. */
  dataStart: number;
}

function readVint(bytes: Uint8Array, pos: number, keepMarker: boolean): Vint | null {
  if (pos >= bytes.length) {
    return null;
  }

  const first = bytes[pos];
  let length = 1;
  let mask = 0x80;

  while (length <= 8 && !(first & mask)) {
    mask >>= 1;
    length++;
  }

  if (length > 8 || pos + length > bytes.length) {
    return null;
  }

  let value = keepMarker ? first : first & (mask - 1);

  for (let i = 1; i < length; i++) {
    value = value * 256 + bytes[pos + i];
  }

  const unknown = !keepMarker && value === 2 ** (7 * length) - 1;

  return { value, length, unknown };
}

function readElement(bytes: Uint8Array, pos: number): Element | null {
  const id = readVint(bytes, pos, true);
  if (!id) {
    return null;
  }

  const size = readVint(bytes, pos + id.length, false);
  if (!size) {
    return null;
  }

  return {
    id: id.value,
    idLength: id.length,
    size,
    dataStart: pos + id.length + size.length,
  };
}

function readUint(bytes: Uint8Array, pos: number, length: number) {
  let value = 0;
  for (let i = 0; i < length; i++) {
    value = value * 256 + bytes[pos + i];
  }
  return value;
}

/** Write `value` as a size vint of exactly `length` bytes. Returns false if it does not fit. */
function writeVint(bytes: Uint8Array, pos: number, length: number, value: number) {
  if (value >= 2 ** (7 * length) - 1) {
    return false;
  }

  let remaining = value;
  for (let i = length - 1; i >= 0; i--) {
    bytes[pos + i] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }
  bytes[pos] |= 0x80 >> (length - 1);

  return true;
}

function encodeDurationElement(duration: number) {
  const element = new Uint8Array(11);
  element[0] = 0x44;
  element[1] = 0x89;
  element[2] = 0x88; // size = 8
  new DataView(element.buffer).setFloat64(3, duration);
  return element;
}

/**
 * Finalize a MediaRecorder WebM: fill in Segment/Cluster sizes and Duration.
 * Returns the original bytes untouched if the data does not look like WebM.
 */
export function finalizeWebmBytes(input: Uint8Array, fallbackDurationMs = 0): Uint8Array {
  const header = readElement(input, 0);
  if (!header || header.id !== ID_EBML || header.size.unknown) {
    return input;
  }

  const segmentPos = header.dataStart + header.size.value;
  const segment = readElement(input, segmentPos);
  if (!segment || segment.id !== ID_SEGMENT) {
    return input;
  }

  // Pass 1: locate Info, read the timecode scale, and find the last block
  // timecode so the stored duration matches the actual media.
  let timecodeScale = DEFAULT_TIMECODE_SCALE;
  let info: Element | null = null;
  let existingDuration: { pos: number; length: number } | null = null;
  let clusterTimecode = 0;
  let lastTimecode = -1;
  const clusters: Element[] = [];

  let pos = segment.dataStart;
  const segmentEnd = segment.size.unknown ? input.length : segment.dataStart + segment.size.value;

  while (pos < segmentEnd) {
    const element = readElement(input, pos);
    if (!element) {
      break;
    }

    if (element.id === ID_CLUSTER) {
      clusters.push(element);
      // Children of an unknown-size cluster follow at this level until the next cluster.
      pos = element.dataStart;
      continue;
    }

    if (element.size.unknown) {
      break; // Only Segment and Cluster may be unknown-size in MediaRecorder output.
    }

    const elementEnd = element.dataStart + element.size.value;

    if (element.id === ID_INFO && !info) {
      info = element;
      let child = element.dataStart;
      while (child < elementEnd) {
        const entry = readElement(input, child);
        if (!entry || entry.size.unknown) {
          break;
        }
        if (entry.id === ID_TIMECODE_SCALE) {
          timecodeScale = readUint(input, entry.dataStart, entry.size.value) || timecodeScale;
        } else if (entry.id === ID_DURATION) {
          existingDuration = { pos: entry.dataStart, length: entry.size.value };
        }
        child = entry.dataStart + entry.size.value;
      }
    } else if (element.id === ID_CLUSTER_TIMECODE) {
      clusterTimecode = readUint(input, element.dataStart, element.size.value);
    } else if (element.id === ID_SIMPLE_BLOCK) {
      lastTimecode = Math.max(lastTimecode, clusterTimecode + readBlockTimecode(input, element));
    } else if (element.id === ID_BLOCK_GROUP) {
      let child = element.dataStart;
      while (child < elementEnd) {
        const entry = readElement(input, child);
        if (!entry || entry.size.unknown) {
          break;
        }
        if (entry.id === ID_BLOCK) {
          lastTimecode = Math.max(lastTimecode, clusterTimecode + readBlockTimecode(input, entry));
        }
        child = entry.dataStart + entry.size.value;
      }
    }

    pos = elementEnd;
  }

  if (!info) {
    return input;
  }

  const durationMs =
    lastTimecode >= 0 ? (lastTimecode * timecodeScale) / 1_000_000 : fallbackDurationMs;
  const duration = (durationMs * 1_000_000) / timecodeScale;

  // Pass 2: build the output. Insert a Duration element if Info has none.
  let output: Uint8Array;
  let shift = 0;

  if (existingDuration) {
    output = Uint8Array.from(input);
    const view = new DataView(output.buffer, output.byteOffset, output.byteLength);
    if (existingDuration.length === 8) {
      view.setFloat64(existingDuration.pos, duration);
    } else if (existingDuration.length === 4) {
      view.setFloat32(existingDuration.pos, duration);
    }
  } else {
    const durationElement = encodeDurationElement(duration);
    const infoSizePos = info.dataStart - info.size.length;
    const newInfoSize = info.size.value + durationElement.length;
    let sizeLength = info.size.length;
    if (newInfoSize >= 2 ** (7 * sizeLength) - 1) {
      sizeLength = 8;
    }

    shift = durationElement.length + (sizeLength - info.size.length);
    const segmentSizeFits =
      segment.size.unknown || segment.size.value + shift < 2 ** (7 * segment.size.length) - 1;

    if (!segmentSizeFits) {
      // Cannot grow a fixed-size segment; leave the file as-is.
      return input;
    }

    output = new Uint8Array(input.length + shift);
    output.set(input.subarray(0, infoSizePos), 0);
    writeVint(output, infoSizePos, sizeLength, newInfoSize);
    output.set(durationElement, infoSizePos + sizeLength);
    output.set(input.subarray(info.dataStart), infoSizePos + sizeLength + durationElement.length);

    if (!segment.size.unknown) {
      writeVint(
        output,
        segmentPos + segment.idLength,
        segment.size.length,
        segment.size.value + shift,
      );
    }
  }

  // Pass 3: write real sizes for the unknown-size Segment and Clusters. The
  // Segment header precedes the inserted Duration, so its offset does not shift.
  if (segment.size.unknown) {
    writeVint(
      output,
      segmentPos + segment.idLength,
      segment.size.length,
      output.length - segment.dataStart,
    );
  }

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (!cluster.size.unknown) {
      continue;
    }
    const clusterStart = cluster.dataStart - cluster.size.length - cluster.idLength + shift;
    const next = clusters[i + 1];
    const clusterEnd = next
      ? next.dataStart - next.size.length - next.idLength + shift
      : output.length;
    writeVint(
      output,
      clusterStart + cluster.idLength,
      cluster.size.length,
      clusterEnd - (cluster.dataStart + shift),
    );
  }

  return output;
}

function readBlockTimecode(bytes: Uint8Array, block: Element) {
  // Block payload: track number (vint), int16 relative timecode, flags.
  const track = readVint(bytes, block.dataStart, false);
  if (!track) {
    return 0;
  }
  const pos = block.dataStart + track.length;
  if (pos + 2 > bytes.length) {
    return 0;
  }
  const raw = (bytes[pos] << 8) | bytes[pos + 1];
  return raw >= 0x8000 ? raw - 0x10000 : raw;
}

export function isWebmMimeType(mimeType: string) {
  return /webm/i.test(mimeType);
}

/**
 * Finalize a recorded WebM blob so external players can read it. Falls back to
 * the original blob if anything goes wrong.
 */
export async function finalizeWebm(blob: Blob, fallbackDurationMs = 0): Promise<Blob> {
  if (!isWebmMimeType(blob.type)) {
    return blob;
  }

  try {
    const input = new Uint8Array(await blob.arrayBuffer());
    const output = finalizeWebmBytes(input, fallbackDurationMs);
    if (output === input) {
      return blob;
    }
    // Copy into a fresh ArrayBuffer so TypeScript accepts it as a BlobPart.
    const bytes = new Uint8Array(output.length);
    bytes.set(output);
    return new Blob([bytes.buffer], { type: blob.type });
  } catch {
    return blob;
  }
}
