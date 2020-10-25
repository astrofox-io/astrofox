import '../crypto.mock';
import Entity from 'core/Entity';

let e;

beforeEach(() => {
  e = new Entity('NewEntity', { speed: '100' });
});

test('create works properly', () => {
  const a = Entity.create(Entity, { id: "321321", properties: {} });
  expect(a.id).toEqual('321321');
  expect(a.properties).toStrictEqual({});
});

describe('constructor works properly', () => {
  test('with properties', () => {
    const a = new Entity('Name', { speed: '100' });
    expect(a.name).toStrictEqual('Name');
    expect(a.properties).toStrictEqual({ speed: '100' });
  });

  test('without properties', () => {
    const a = new Entity('Name');
    expect(a.name).toStrictEqual('Name');
    expect(a.properties).toStrictEqual({});
  });
});

describe('update works properly', () => {
  test('properties is typeof function', () => {
    const speedUp = props => {
      return { ...props, speed: '200' };
    };
    expect(e.update(speedUp)).toBe(true);
  });

  test('properties is not typeof function', () => {
    expect(e.update({ speed: '200' })).toBe(true);
  });
});

test('toString works provided', () => {
  expect(e.toString()).toEqual(`[NewEntity ${e.id}]`);
});

test('toJSON works property', () => {
  expect(e.toJSON()).toEqual({ id: `${e.id}`, name: 'NewEntity', properties: { speed: '100' } });
});
