import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Trophy,
  Package,
  Building2,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryStats } from '@/services/inventory';
import { getBrandLogo } from '@/data/brands';
import type { DashboardTabKey } from '@/constants/navigation';

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

export default function DashboardScreen({ onTabChange }: Props) {
  const { colors, spacing, radii, shadows } = useTheme();
  const headerAnim = useRef(new Animated.Value(-10)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getInventoryStats();
      setStats(data as Stats);
    } catch (error) {
      console.warn('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const totalStock = stats?.totalQuantity || 0;
  const activeBrands = stats?.brandDistribution?.length || 0;
  const bestSeller = stats?.bestSelling?.model || 'N/A';
  const potentialProfit = stats?.potentialProfit || 0;

  const topBrands = Array.isArray(stats?.brandDistribution)
    ? [...stats.brandDistribution].sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0))
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerAnim }],
            },
          ]}
        >
          <View>
            <Text style={[styles.welcome, { color: colors.textSecondary }]}>{greeting},</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              <Text style={styles.bold}>Inventory</Text> Overview
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => onTabChange('Settings')}
          >
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileText}>JD</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Analyzing Inventory...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.mainStatsRow}>
              <View style={[styles.mainStat, { backgroundColor: colors.bgCard }, shadows.card]}>
                <Package size={24} color={colors.primary} />
                <Text style={[styles.mainStatValue, { color: colors.textPrimary }]}>{totalStock}</Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>Total Stock</Text>
              </View>
              <View style={[styles.mainStat, { backgroundColor: colors.bgCard }, shadows.card]}>
                <Building2 size={24} color={colors.primary} />
                <Text style={[styles.mainStatValue, { color: colors.textPrimary }]}>{activeBrands}</Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>Brands</Text>
              </View>
              <View style={[styles.mainStat, { backgroundColor: colors.bgCard }, shadows.card]}>
                <TrendingUp size={24} color={colors.primary} />
                <Text style={[styles.mainStatValue, { color: colors.success }]}>
                  ₹{(potentialProfit / 1000).toFixed(1)}k
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>Est. Profit</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.featuredCard, shadows.card]}
              activeOpacity={0.9}
              onPress={() => onTabChange('Stocks')}
            >
              <LinearGradient
                colors={[colors.primary, '#333']}
                style={styles.featuredGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredTag}>
                    <Trophy size={14} color="#FFF" />
                    <Text style={styles.featuredTagText}>BEST SELLER</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{bestSeller}</Text>
                  <Text style={styles.featuredSub}>Most demanded unit in current inventory</Text>
                </View>
                <Zap size={60} color="rgba(255,255,255,0.1)" style={styles.featuredIcon} />
              </LinearGradient>
            </TouchableOpacity>

            {topBrands.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Brand Distribution</Text>
                  <TouchableOpacity onPress={() => onTabChange('Stocks')}>
                    <Text style={[styles.viewAll, { color: colors.textSecondary }]}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.brandScroll}
                >
                  {topBrands.map((brand) => {
                    const logo = getBrandLogo(brand._id);
                    return (
                      <View
                        key={brand._id}
                        style={[styles.brandCard, { backgroundColor: colors.bgCard }, shadows.card]}
                      >
                        <View style={[styles.brandLogoBox, { backgroundColor: colors.bg }]}>
                          {logo ? (
                            <Image
                              source={logo}
                              style={styles.brandLogo}
                              resizeMode="contain"
                            />
                          ) : (
                            <Package size={24} color={colors.primary} />
                          )}
                        </View>
                        <Text style={[styles.brandName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {brand._id}
                        </Text>
                        <Text style={[styles.brandCount, { color: colors.textSecondary }]}>
                          {brand.totalQuantity} Units
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.smallActionCard, { backgroundColor: colors.bgCard }, shadows.card]}
                onPress={() => onTabChange('AddStock')}
              >
                <View style={styles.actionIconBox}>
                  <Package size={20} color={colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Add New Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallActionCard, { backgroundColor: colors.bgCard }, shadows.card]}
                onPress={() => onTabChange('History')}
              >
                <View style={styles.actionIconBox}>
                  <TrendingUp size={20} color={colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Sales History</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcome: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    marginTop: 2,
  },
  bold: { fontWeight: '700' },
  profileBadge: {
    width: 45,
    height: 45,
    borderRadius: 9999,
    backgroundColor: '#FFF',
    padding: 3,
  },
  profilePlaceholder: {
    flex: 1,
    borderRadius: 9999,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    gap: 25,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  mainStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mainStat: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  mainStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGrad: {
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredContent: {
    flex: 1,
    gap: 10,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  featuredTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  featuredSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  featuredIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  section: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  brandScroll: {
    paddingRight: 20,
    gap: 12,
  },
  brandCard: {
    width: 130,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
  },
  brandCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
