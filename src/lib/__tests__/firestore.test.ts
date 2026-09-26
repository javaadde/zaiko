import { tsToMs, tsToMsOrNull, msToTs, serverTs } from '../firestore';
import { Timestamp, serverTimestamp } from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/firestore', () => ({
  Timestamp: {
    fromMillis: jest.fn((ms) => ({ toMillis: () => ms })),
  },
  serverTimestamp: jest.fn(() => ({ type: 'serverTimestamp' })),
}));

describe('firestore utilities', () => {
  describe('tsToMs', () => {
    it('returns the number directly if input is a number', () => {
      expect(tsToMs(123456789)).toBe(123456789);
    });

    it('calls toMillis if input is a Timestamp', () => {
      const ts = { toMillis: () => 987654321 };
      expect(tsToMs(ts as any)).toBe(987654321);
    });

    it('returns Date.now() if input is null', () => {
      const now = 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      expect(tsToMs(null)).toBe(now);
      jest.restoreAllMocks();
    });

    it('returns Date.now() if input is undefined', () => {
      const now = 1000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      expect(tsToMs(undefined)).toBe(now);
      jest.restoreAllMocks();
    });
  });

  describe('tsToMsOrNull', () => {
    it('returns null if input is null', () => {
      expect(tsToMsOrNull(null)).toBeNull();
    });

    it('returns null if input is undefined', () => {
      expect(tsToMsOrNull(undefined)).toBeNull();
    });

    it('returns the number directly if input is a number', () => {
      expect(tsToMsOrNull(123456789)).toBe(123456789);
    });

    it('calls toMillis if input is a Timestamp', () => {
      const ts = { toMillis: () => 987654321 };
      expect(tsToMsOrNull(ts as any)).toBe(987654321);
    });
  });

  describe('msToTs', () => {
    it('calls Timestamp.fromMillis with the correct value', () => {
      const result = msToTs(123);
      expect(Timestamp.fromMillis).toHaveBeenCalledWith(123);
      expect(result.toMillis()).toBe(123);
    });
  });

  describe('serverTs', () => {
    it('calls serverTimestamp', () => {
      const result = serverTs();
      expect(serverTimestamp).toHaveBeenCalled();
      expect(result).toEqual({ type: 'serverTimestamp' });
    });
  });
});
