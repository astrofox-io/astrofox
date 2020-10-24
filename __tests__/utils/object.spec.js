import { updateExistingProps } from 'utils/object';

describe('updateExistingProps works properly', () => {
  test('oldProps !== newProps', () => {
    const oldProps = { speed: "100" };
    const newProps = { speed: "200"};
    expect(updateExistingProps(oldProps, newProps)).toBeTruthy();
  });

  test('oldProps === newProps', () => {
    const oldProps = { speed: "100" };
    const newProps = { speed: "100" };
    expect(updateExistingProps(oldProps, newProps)).toBeFalsy();
  });
});
