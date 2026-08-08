import React, { Suspense, lazy } from 'react';

const LazyArchivedStocksScreen = lazy(() => import('@/screens/ArchivedStocksScreen'));

export default function ArchivedStocksRoute() {
  return (
    <Suspense fallback={null}>
      <LazyArchivedStocksScreen />
    </Suspense>
  );
}
