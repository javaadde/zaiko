import { getUserFriendlyError } from './errors';

describe('getUserFriendlyError', () => {
  it('returns the string if error is a string', () => {
    expect(getUserFriendlyError('String error', 'fallback')).toBe('String error');
  });

  it('returns the message property if error is an object with a message', () => {
    expect(getUserFriendlyError({ message: 'Object error' }, 'fallback')).toBe('Object error');
  });

  it('returns the message from an Error instance', () => {
    const err = new Error('Instance error');
    expect(getUserFriendlyError(err, 'fallback')).toBe('Instance error');
  });

  it('returns the fallback if error is an object without a message', () => {
    expect(getUserFriendlyError({ foo: 'bar' }, 'fallback')).toBe('fallback');
  });

  it('returns the fallback if error object has undefined message', () => {
    expect(getUserFriendlyError({ message: undefined }, 'fallback')).toBe('fallback');
  });

  it('returns the fallback if error is null', () => {
    expect(getUserFriendlyError(null, 'fallback')).toBe('fallback');
  });

  it('returns the fallback if error is undefined', () => {
    expect(getUserFriendlyError(undefined, 'fallback')).toBe('fallback');
  });

  it('returns the fallback if error is a number', () => {
    expect(getUserFriendlyError(123, 'fallback')).toBe('fallback');
  });

  it('returns the fallback if error is a boolean', () => {
    expect(getUserFriendlyError(true, 'fallback')).toBe('fallback');
  });

  it('converts non-string messages to string', () => {
    expect(getUserFriendlyError({ message: 404 }, 'fallback')).toBe('404');
  });
});
