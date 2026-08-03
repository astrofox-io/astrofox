export function trimChars(str: string) {
  return Array.from(str)
    .filter(character => {
      const code = character.charCodeAt(0);
      return code > 0x1f && (code < 0x7f || code > 0x9f);
    })
    .join('');
}
