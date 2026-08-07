import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export async function requestTrackingOnce() {
  try {
    const { status } = await getTrackingPermissionsAsync();
    if (status === 'undetermined') {
      await requestTrackingPermissionsAsync();
    }
  } catch {
    // no-op
  }
}
