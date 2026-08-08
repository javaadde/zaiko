import React, { Suspense, lazy } from 'react';
import { useRouter } from 'expo-router';
import { dashboardTabRoutes } from '@/constants/navigation';

const LazyDashboardScreen = lazy(() => import('@/screens/DashboardScreen'));

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <Suspense fallback={null}>
      <LazyDashboardScreen
        onTabChange={(tab) => {
          const route = dashboardTabRoutes[tab];
          if (route) router.push(route as never);
        }}
      />
    </Suspense>
  );
}
