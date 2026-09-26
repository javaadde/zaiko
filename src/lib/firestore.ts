import { Timestamp, serverTimestamp } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { TimestampMs } from '@/types';

type TimestampLike =
  | FirebaseFirestoreTypes.Timestamp
  | { toMillis: () => number }
  | number
  | null
  | undefined;

export function tsToMs(
  val: TimestampLike,
): TimestampMs {
  if (typeof val === 'number') return val;
  return val?.toMillis() ?? Date.now();
}

export function tsToMsOrNull(val: TimestampLike): TimestampMs | null {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  return val.toMillis();
}

export function msToTs(ms: TimestampMs): FirebaseFirestoreTypes.Timestamp {
  return Timestamp.fromMillis(ms);
}

export function serverTs(): FirebaseFirestoreTypes.Timestamp {
  return serverTimestamp() as unknown as FirebaseFirestoreTypes.Timestamp;
}
