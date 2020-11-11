import { updateExistingProps } from 'utils/object';
import cloneDeep from 'lodash/cloneDeep';

describe('updateExistingProps works properly', () => {
  test('oldProps !== newProps', () => {
    const oldProps = { speed: "100", theta: 75, acceleration: "2m/s", undefined: null };
    const newProps = { speed: "200", direction: 75, acceleration: 4.2, undefined: undefined };
    const result = updateExistingProps(oldProps, newProps);
    expect(result).toBeTruthy();
    expect(oldProps).toStrictEqual({ speed: "200", theta: 75, acceleration: 4.2, undefined: undefined });
  });

  test('oldProps === newProps', () => {
    const oldProps = { speed: "100", theta: 75, acceleration: "2m/s", undefined: undefined };
    const newProps = { speed: "100", theta: 75, direction: 75, acceleration: "2m/s", undefined: undefined };
    const oldPropsDup = cloneDeep(oldProps);
    const result = updateExistingProps(oldProps, newProps);
    expect(result).toBeFalsy();
    expect(oldProps).toStrictEqual(oldPropsDup);
  });
});
