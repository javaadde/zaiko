import React, { Suspense, lazy } from 'react';

const LazyAddStockScreen = lazy(() => import('@/screens/AddStockScreen'));

export default function AddRoute() {
  return (
    <Suspense fallback={null}>
      <LazyAddStockScreen />
    </Suspense>
  );
}
