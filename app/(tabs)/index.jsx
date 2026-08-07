import DashboardScreen from '../../src/screens/DashboardScreen';
import { useRouter } from 'expo-router';
import AnimatedPage from '../../src/components/AnimatedPage';
import { dashboardTabRoutes } from '../../src/constants/navigation';

export default function DashboardRoute() {
  const router = useRouter();
  return (
    <AnimatedPage>
      <DashboardScreen
        onTabChange={(tab) => {
          const route = dashboardTabRoutes[tab];
          if (route) router.push(route);
        }}
      />
    </AnimatedPage>
  );
}
