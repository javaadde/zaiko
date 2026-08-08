import React, { Suspense, lazy } from 'react';

const LazySellVerifyScreen = lazy(() => import('@/screens/SellVerifyScreen'));

export default function SellVerifyRoute() {
  return (
    <Suspense fallback={null}>
      <LazySellVerifyScreen />
    </Suspense>
  );
}
