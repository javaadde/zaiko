import React, { Suspense, lazy } from 'react';

const LazySalesHistoryScreen = lazy(() => import('@/screens/SalesHistoryScreen'));

export default function HistoryRoute() {
  return (
    <Suspense fallback={null}>
      <LazySalesHistoryScreen />
    </Suspense>
  );
}
