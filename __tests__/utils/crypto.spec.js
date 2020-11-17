import { uniqueId } from 'utils/crypto';

test('uniqueId functions exists', () => {
  expect(uniqueId()).toBeDefined();
});

test('unique id has a length of 40 characters', () => {
  expect(uniqueId()).toHaveLength(40);
});
