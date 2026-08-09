import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryStats } from '@/services/inventory';
import { getSales } from '@/services/sales';
import type { DashboardTabKey } from '@/constants/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { Sale } from '@/types';

type Props = {
  onTabChange: (tab: DashboardTabKey) => void;
};

type Stats = {
  totalQuantity: number;
  totalPurchase: number;
  totalSelling: number;
  potentialProfit: number;
  brandDistribution: { _id: string; totalQuantity: number }[];
  bestSelling: { model?: string } | null;
};

// Helper function to generate smooth SVG arc path string with rounded caps
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

// 3-dots cluster icon in top header
function ClusterMenuIcon({ color }: { color: string }) {
  return (
    <View style={styles.clusterWrap}>
      <View style={[styles.clusterDot, { backgroundColor: color }]} />
      <View style={styles.clusterRow}>
        <View style={[styles.clusterDot, { backgroundColor: color }]} />
        <View style={[styles.clusterDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

// Custom Donut Chart component with callout badges
function MonthlyProfitsDonutChart({ totalAmount }: { totalAmount: number }) {
  const formattedTotal = `$${totalAmount.toLocaleString()}`;

  // SVG dimensions
  const size = 270;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 94;
  const strokeWidth = 34;

  // Arc angles (matching reference image: Purple 60%, Sage Green 24%, Yellow 16%)
  // Purple arc (60% ~ 216deg): -145deg to 55deg
  const purplePath = describeArc(cx, cy, radius, -145, 55);
  // Sage green arc (24% ~ 86deg): 68deg to 148deg
  const greenPath = describeArc(cx, cy, radius, 68, 148);
  // Yellow arc (16% ~ 58deg): 162deg to 204deg
  const yellowPath = describeArc(cx, cy, radius, 162, 204);

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Purple Arc */}
        <Path
          d={purplePath}
          fill="none"
          stroke="#9A93FE"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Sage Green Arc */}
        <Path
          d={greenPath}
          fill="none"
          stroke="#BACBA8"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Yellow Arc */}
        <Path
          d={yellowPath}
          fill="none"
          stroke="#F6D66B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.centerTextContainer}>
        <Text style={styles.centerLabel}>Total</Text>
        <Text style={styles.centerAmount}>{formattedTotal}</Text>
      </View>

      {/* Callout Tooltip Badges */}
      {/* 1. Top Right Badge ($18,325) */}
      <View style={styles.badgeTopRight}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>$ 18,325</Text>
        </View>
        <View style={styles.badgePointerDown} />
      </View>

      {/* 2. Middle Right Badge ($12,216) */}
      <View style={styles.badgeMiddleRight}>
        <View style={styles.badgePointerLeft} />
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>$ 12,216</Text>
        </View>
      </View>

      {/* 3. Bottom Left Badge ($45,813) */}
      <View style={styles.badgeBottomLeft}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>$ 45,813</Text>
        </View>
        <View style={styles.badgePointerDownCenter} />
      </View>
    </View>
  );
}

export default function DashboardScreen({ onTabChange }: Props) {
  const { colors, scheme } = useTheme();
  const { currentCompany, currentEnvironment } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentCompany || !currentEnvironment) {
      setStats(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [statsData, salesData] = await Promise.all([
        getInventoryStats(),
        getSales(),
      ]);
      setStats(statsData as Stats);
      setSales(salesData.slice(0, 5));
    } catch (error) {
      console.warn('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentCompany, currentEnvironment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const totalProfit = stats?.potentialProfit || 76356;

  // Fallback demo recent sales matching reference mockup
  const defaultRecentSales = [
    {
      id: '1',
      name: 'Steven Summer',
      timeAgo: '02 Minutes Ago',
      amount: '+ $52.00',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Jordan Maizee',
      timeAgo: '14 Minutes Ago',
      amount: '+ $84.50',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Sophia Turner',
      timeAgo: '45 Minutes Ago',
      amount: '+ $120.00',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#141519' : '#F6F6F0' }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Profits...</Text>
          </View>
        ) : (
          <View style={styles.contentWrap}>
            {/* TOP SECTION: Monthly Profits Header & Chart */}
            <View style={styles.topSection}>
              {/* Title & Header Action Row */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.pageTitle, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                    Monthly Profits
                  </Text>
                  <Text style={[styles.pageSubtitle, { color: scheme === 'dark' ? '#9CA3AF' : '#8C8F99' }]}>
                    Total Profit Growth of 26%
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.menuBtn,
                    { backgroundColor: scheme === 'dark' ? '#252730' : '#EFEFE8' },
                  ]}
                  activeOpacity={0.7}
                >
                  <ClusterMenuIcon color={scheme === 'dark' ? '#FFFFFF' : '#18191E'} />
                </TouchableOpacity>
              </View>

              {/* Donut Chart with Tooltips */}
              <MonthlyProfitsDonutChart totalAmount={totalProfit} />

              {/* Category Breakdown (Giveaway, Affiliate, Offline Sales) */}
              <View style={styles.breakdownRow}>
                {/* Giveaway 60% */}
                <View style={styles.breakdownCol}>
                  <Text style={[styles.categoryLabel, { color: scheme === 'dark' ? '#9CA3AF' : '#9E9EA4' }]}>
                    Giveaway
                  </Text>
                  <Text style={[styles.categoryPercent, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                    60%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: scheme === 'dark' ? '#2C2D36' : '#ECEBE4' }]}>
                    <View style={[styles.barFill, { width: '60%', backgroundColor: '#9A93FE' }]} />
                  </View>
                </View>

                {/* Affiliate 24% */}
                <View style={styles.breakdownCol}>
                  <Text style={[styles.categoryLabel, { color: scheme === 'dark' ? '#9CA3AF' : '#9E9EA4' }]}>
                    Affiliate
                  </Text>
                  <Text style={[styles.categoryPercent, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                    24%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: scheme === 'dark' ? '#2C2D36' : '#ECEBE4' }]}>
                    <View style={[styles.barFill, { width: '40%', backgroundColor: '#BACBA8' }]} />
                  </View>
                </View>

                {/* Offline Sales 16% */}
                <View style={styles.breakdownCol}>
                  <Text style={[styles.categoryLabel, { color: scheme === 'dark' ? '#9CA3AF' : '#9E9EA4' }]}>
                    Offline Sales
                  </Text>
                  <Text style={[styles.categoryPercent, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                    16%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: scheme === 'dark' ? '#2C2D36' : '#ECEBE4' }]}>
                    <View style={[styles.barFill, { width: '30%', backgroundColor: '#F6D66B' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* BOTTOM SECTION: Recent Sales Sheet Card */}
            <View style={[styles.recentSalesCard, { backgroundColor: scheme === 'dark' ? '#1F2026' : '#EDECE6' }]}>
              <View style={styles.recentSalesHeader}>
                <Text style={[styles.recentSalesTitle, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                  Recent Sales
                </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => onTabChange('History')}>
                  <Text style={[styles.seeAllText, { color: scheme === 'dark' ? '#9CA3AF' : '#A09E96' }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.salesList}>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <View
                      key={sale.id}
                      style={[
                        styles.saleItemCard,
                        { backgroundColor: scheme === 'dark' ? '#2A2C35' : '#FFFFFF' },
                      ]}
                    >
                      <View style={styles.avatarWrap}>
                        <View style={styles.avatarInitialsBg}>
                          <Text style={styles.avatarInitialsText}>
                            {sale.customerName ? sale.customerName.charAt(0).toUpperCase() : 'S'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.saleItemMeta}>
                        <Text
                          style={[styles.saleCustomerName, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}
                          numberOfLines={1}
                        >
                          {sale.customerName}
                        </Text>
                        <Text style={[styles.saleTimeText, { color: scheme === 'dark' ? '#9CA3AF' : '#9CA3AF' }]}>
                          Just now
                        </Text>
                      </View>

                      <Text style={[styles.saleAmountText, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                        + ${sale.salePrice.toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  defaultRecentSales.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.saleItemCard,
                        { backgroundColor: scheme === 'dark' ? '#2A2C35' : '#FFFFFF' },
                      ]}
                    >
                      <Image source={{ uri: item.avatar }} style={styles.avatarImg} />

                      <View style={styles.saleItemMeta}>
                        <Text style={[styles.saleCustomerName, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.saleTimeText, { color: scheme === 'dark' ? '#9CA3AF' : '#9CA3AF' }]}>
                          {item.timeAgo}
                        </Text>
                      </View>

                      <Text style={[styles.saleAmountText, { color: scheme === 'dark' ? '#FFFFFF' : '#18191E' }]}>
                        {item.amount}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 50,
  },
  contentWrap: {
    gap: 0,
  },
  loadingContainer: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Header Section
  topSection: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterWrap: {
    width: 14,
    height: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clusterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  clusterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Donut Chart Container & Center Content
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
    height: 280,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8C8F99',
    marginBottom: 2,
  },
  centerAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#18191E',
    letterSpacing: -0.8,
  },
  // Callout Tooltips
  badgePill: {
    backgroundColor: '#18191E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Top Right Badge
  badgeTopRight: {
    position: 'absolute',
    top: 24,
    right: 32,
    alignItems: 'center',
  },
  badgePointerDown: {
    width: 7,
    height: 7,
    backgroundColor: '#18191E',
    transform: [{ rotate: '45deg' }],
    marginTop: -3.5,
  },
  // Middle Right Badge
  badgeMiddleRight: {
    position: 'absolute',
    top: 136,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePointerLeft: {
    width: 7,
    height: 7,
    backgroundColor: '#18191E',
    transform: [{ rotate: '45deg' }],
    marginRight: -3.5,
  },
  // Bottom Left Badge
  badgeBottomLeft: {
    position: 'absolute',
    bottom: 68,
    left: 28,
    alignItems: 'center',
  },
  badgePointerDownCenter: {
    width: 7,
    height: 7,
    backgroundColor: '#18191E',
    transform: [{ rotate: '45deg' }],
    marginTop: -3.5,
  },
  // Category Breakdown
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 16,
  },
  breakdownCol: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryPercent: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Recent Sales Section
  recentSalesCard: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 110,
    marginTop: 8,
  },
  recentSalesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentSalesTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  salesList: {
    gap: 10,
  },
  saleItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatarInitialsBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#18191E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saleItemMeta: {
    flex: 1,
  },
  saleCustomerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  saleTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saleAmountText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

