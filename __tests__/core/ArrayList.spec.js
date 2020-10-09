import ArrayList from 'core/ArrayList';

let a;

beforeEach(() => {
  a = new ArrayList(1, 2, 3);
});

test('arraylist is instance of array', () => {
  expect(a).toBeInstanceOf(Array);
});

describe('isEmpty method working properly', () => {
  test('empty arraylist', () => {
    expect(new ArrayList().isEmpty()).toBe(true);
  });

  test('non-empty arraylist', () => {
    expect(a.isEmpty()).toBe(false);
  });
});

test('insert method working properly', () => {
  a.insert(5, 1);
  expect(a).toEqual([1, 5, 2, 3]);
});

test('remove method working properly', () => {
  a.remove(0);
  expect(a).toEqual([2, 3]);
});

describe('swap method working properly', () => {
  test('different indexes', () => {
    a.swap(0, 2);
    expect(a).toEqual([3, 2, 1]);
  });

  test('same indexes', () => {
    a.swap(0, 0);
    expect(a).toEqual([1, 2, 3]);
  });
});

test('clear method working properly', () => {
  a.clear();
  expect(a).toEqual([]);
});
