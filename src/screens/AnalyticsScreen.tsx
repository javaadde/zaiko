import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  TrendingUp,
  DollarSign,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryStats } from '@/services/inventory';
import { useAuthStore } from '@/stores/auth-store';

type AnimatedNumberProps = {
  target: number;
  prefix?: string;
  suffix?: string;
  style: any;
};

function AnimatedNumber({ target, prefix = '', suffix = '', style }: AnimatedNumberProps) {
  const [animVal] = useState(() => new Animated.Value(0));
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    Animated.timing(animVal, {
      toValue: isNaN(num) ? 0 : num,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const id = animVal.addListener(({ value }) => {
      setDisplay(
        Number.isInteger(num)
          ? Math.floor(value).toLocaleString()
          : value.toFixed(1),
      );
    });
    return () => animVal.removeListener(id);
  }, [animVal, target]);

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}

function LineGraph({ data, labels, color, height = 120 }: { data: number[]; labels: string[]; color: string; height?: number }) {
  const { width } = Dimensions.get('window');
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * (width - 70) : (width - 70) / 2,
    y: height - ((v - min) / range) * (height - 30) - 10,
  }));

  return (
    <View style={{ height: height + 40, marginTop: 20 }}>
      <View style={styles.graphContainer}>
        {pts.length > 1 &&
          pts.slice(0, -1).map((pt, i) => {
            const next = pts[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={[
                  styles.graphLine,
                  {
                    left: pt.x,
                    top: pt.y,
                    width: len,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 0',
                  },
                ]}
              />
            );
          })}
        {pts.map((pt, i) => (
          <View
            key={i}
            style={[
              styles.graphDot,
              {
                left: pt.x - 4,
                top: pt.y - 4,
                backgroundColor: color,
                borderColor: '#FFF',
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.lgLabels}>
        {labels.map((l, i) => (
          <Text key={i} style={styles.lgLabel}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { colors, shadows } = useTheme();
  const { currentCompany, currentEnvironment } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const fetchStats = useCallback(async () => {
    if (!currentCompany || !currentEnvironment) {
      setStats(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await getInventoryStats();
      setStats(data);
    } catch (error) {
      console.warn('Analytics fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentCompany, currentEnvironment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStats();
    }, 0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timer);
  }, [fadeAnim, fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = stats?.monthlyTrends?.map((t: any) => t.count) || [0];
  const chartLabels = stats?.monthlyTrends?.map((t: any) => monthNames[t._id - 1]) || ['Start'];

  const sellingValue = stats?.totalSelling || 0;
  const purchaseValue = stats?.totalPurchase || 0;
  const profit = sellingValue - purchaseValue;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your performance</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { backgroundColor: colors.bgCardAlt }, shadows.card]}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <DollarSign size={20} color="#3B82F6" />
                </View>
                <AnimatedNumber
                  target={sellingValue / 1000}
                  prefix="₹"
                  suffix="k"
                  style={[styles.kpiValue, { color: colors.textPrimary }]}
                />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Stock Value</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: colors.bgCardAlt }, shadows.card]}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <AnimatedNumber
                  target={profit / 1000}
                  prefix="₹"
                  suffix="k"
                  style={[styles.kpiValue, { color: colors.textPrimary }]}
                />
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Potential Profit</Text>
              </View>
            </View>

            <View style={[styles.graphCard, { backgroundColor: colors.bgCardAlt }, shadows.card]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Inventory Growth</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Monthly</Text>
                </View>
              </View>

              <LineGraph data={chartData} labels={chartLabels} color={colors.accent} height={120} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '300' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  loadingBox: { paddingVertical: 100, alignItems: 'center', gap: 12 },
  loadingText: { color: '#999', fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  kpiIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  graphCard: { borderRadius: 16, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase' },
  graphContainer: { height: 120, position: 'relative' },
  graphLine: { position: 'absolute', height: 2, borderRadius: 1 },
  graphDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  lgLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  lgLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
});
