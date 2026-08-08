import React, { Suspense, lazy } from 'react';

const LazySettingsScreen = lazy(() => import('@/screens/SettingsScreen'));

export default function SettingsRoute() {
  return (
    <Suspense fallback={null}>
      <LazySettingsScreen />
    </Suspense>
  );
}
