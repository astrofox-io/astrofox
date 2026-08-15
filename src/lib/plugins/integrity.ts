export async function computeIntegrity(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest('SHA-384', bytes);
  let binary = '';
  for (const byte of new Uint8Array(digest)) {
    binary += String.fromCharCode(byte);
  }
  return `sha384-${btoa(binary)}`;
}

export async function verifyIntegrity(content: string, expected: string): Promise<boolean> {
  if (!expected) {
    return false;
  }
  return (await computeIntegrity(content)) === expected;
}
