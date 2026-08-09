import { Timestamp, serverTimestamp } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { TimestampMs } from '@/types';

export function tsToMs(
  val: FirebaseFirestoreTypes.Timestamp | null | undefined,
): TimestampMs {
  return val?.toMillis() ?? Date.now();
}

export function msToTs(ms: TimestampMs): FirebaseFirestoreTypes.Timestamp {
  return Timestamp.fromMillis(ms);
}

export function serverTs(): FirebaseFirestoreTypes.Timestamp {
  return serverTimestamp() as FirebaseFirestoreTypes.Timestamp;
}
