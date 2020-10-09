import { trimChars } from 'utils/string';

test('trim chars from string properly', () => {
  expect(trimChars("hello there\v")).toBe("hello there");
});
