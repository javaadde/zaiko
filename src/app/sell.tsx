import React, { Suspense, lazy } from 'react';

const LazySellScreen = lazy(() => import('@/screens/SellScreen'));

export default function SellRoute() {
  return (
    <Suspense fallback={null}>
      <LazySellScreen />
    </Suspense>
  );
}
