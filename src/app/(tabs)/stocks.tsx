import React, { Suspense, lazy } from 'react';

const LazyStocksScreen = lazy(() => import('@/screens/StocksScreen'));

export default function StocksRoute() {
  return (
    <Suspense fallback={null}>
      <LazyStocksScreen />
    </Suspense>
  );
}
