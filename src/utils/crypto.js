const byteToHex = [];

for (let n = 0; n <= 0xff; ++n) {
  byteToHex.push(n.toString(16).padStart(2, '0'));
}

function toHexString(buffer) {
  const hexOctets = new Array(buffer.length);

  for (let i = 0; i < buffer.length; ++i) {
    hexOctets[i] = byteToHex[buffer[i]];
  }

  return hexOctets.join('');
}

export function uniqueId() {
  return toHexString(window.crypto.getRandomValues(new Uint8Array(20)));
}
