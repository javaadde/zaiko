export const dashboardTabRoutes = {
  Stocks: '/stocks',
  AddStock: '/add',
  History: '/history',
  Settings: '/settings',
} as const;

export type DashboardTabKey = keyof typeof dashboardTabRoutes;
