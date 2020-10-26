import '../crypto.mock';
import EntityList from 'core/EntityList';
import Entity from 'core/Entity';

let e;
let obj1;
let obj2;
let obj3;

beforeEach(() => {
  obj1 = new Entity('Object1');
  obj2 = new Entity('Object2');
  obj3 = new Entity('Object3');

  e = new EntityList(obj1, obj2);
});

describe('getElementById method works properly', () => {
  test('valid id', () => {
    expect(e.getElementById(obj1.id)).toEqual(obj1);
  });

  test('invalid id', () => {
    expect(e.getElementById(3)).toBeUndefined();
  });
});

describe('hasElement method works properly', () => {
  test('valid object', () => {
    expect(e.hasElement(obj1)).toBe(true);
  });

  test('invalid object', () => {
    expect(e.hasElement(obj3)).toBe(false);
  });
});

describe('addElement method works properly', () => {
  test('no object provided', () => {
    expect(e.addElement()).toBeUndefined();
  });

  test('index provided', () => {
    expect(e.addElement(obj3, 1)).toEqual(obj3);
  });

  test('no index provided', () => {
    expect(e.addElement(obj3)).toEqual(obj3);
  });
});

describe('removeElement method works properly', () => {
  test('element exists', () => {
    expect(e.removeElement(obj2)).toBe(true);
  });

  test('element does not exist', () => {
    expect(e.removeElement({ id: 3 })).toBe(false);
  });
});

describe('shiftElement method works properly', () => {
  test('element exists', () => {
    expect(e.shiftElement(obj2, 1)).toBe(false);
  });

  test('element does not exist', () => {
    expect(e.shiftElement(obj3, 1)).toBe(false);
  });
});

test('toJSON method works properly', () => {
  expect(e.toJSON()).toEqual([
    { id: `${e[0].id}`, name: 'Object1', properties: {} },
    { id: `${e[1].id}`, name: 'Object2', properties: {} },
  ]);
});

// Extra EntityList tests
describe('isEmpty method working properly', () => {
  test('empty EntityList', () => {
    expect(new EntityList().isEmpty()).toBe(true);
  });

  test('non-empty EntityList', () => {
    expect(e.isEmpty()).toBe(false);
  });
});

test('clear method working properly', () => {
  e.clear();
  expect(e).toEqual([]);
});
