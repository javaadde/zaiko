import DashboardScreen from '@/screens/DashboardScreen';
import { useRouter } from 'expo-router';
import AnimatedPage from '@/components/AnimatedPage';
import { dashboardTabRoutes } from '@/constants/navigation';

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <AnimatedPage>
      <DashboardScreen
        onTabChange={(tab) => {
          const route = dashboardTabRoutes[tab];
          if (route) router.push(route as never);
        }}
      />
    </AnimatedPage>
  );
}
