import React from 'react';
import { useRouter } from 'expo-router';
import { dashboardTabRoutes } from '@/constants/navigation';
import DashboardScreen from '@/screens/DashboardScreen';

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <DashboardScreen
      onTabChange={(tab) => {
        const route = dashboardTabRoutes[tab];
        if (route) router.push(route as never);
      }}
    />
  );
}

