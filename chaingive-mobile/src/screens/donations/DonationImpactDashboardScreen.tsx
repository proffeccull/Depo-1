import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Import chart components (assuming react-native-chart-kit or similar)
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

interface DonationData {
  id: string;
  amount: number;
  category: string;
  timestamp: string;
  beneficiary: string;
  impact: string;
}

interface ProjectData {
  id: string;
  name: string;
  category: string;
  totalRaised: number;
  goal: number;
  beneficiaries: number;
  status: 'active' | 'completed' | 'paused';
}

interface BeneficiaryStory {
  id: string;
  name: string;
  story: string;
  impact: string;
  category: string;
  timestamp: string;
}

type TimeFilter = '7d' | '30d' | '90d' | '1y' | 'all';
type CategoryFilter = 'all' | 'education' | 'healthcare' | 'environment' | 'poverty' | 'emergency';

const DonationImpactDashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Mock data - replace with actual API calls
  const [donationData, setDonationData] = useState<DonationData[]>([]);
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [beneficiaryStories, setBeneficiaryStories] = useState<BeneficiaryStory[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter, categoryFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data loading - replace with actual API calls
      const mockDonations: DonationData[] = [
        { id: '1', amount: 5000, category: 'education', timestamp: '2024-01-15', beneficiary: 'Local School', impact: 'Educated 50 children' },
        { id: '2', amount: 3000, category: 'healthcare', timestamp: '2024-01-20', beneficiary: 'Community Clinic', impact: 'Provided medical care to 100 patients' },
        { id: '3', amount: 8000, category: 'environment', timestamp: '2024-01-25', beneficiary: 'Green Initiative', impact: 'Planted 500 trees' },
      ];

      const mockProjects: ProjectData[] = [
        { id: '1', name: 'School Building Project', category: 'education', totalRaised: 150000, goal: 200000, beneficiaries: 300, status: 'active' },
        { id: '2', name: 'Medical Outreach', category: 'healthcare', totalRaised: 75000, goal: 100000, beneficiaries: 500, status: 'active' },
        { id: '3', name: 'Clean Water Initiative', category: 'environment', totalRaised: 120000, goal: 120000, beneficiaries: 1000, status: 'completed' },
      ];

      const mockStories: BeneficiaryStory[] = [
        { id: '1', name: 'Sarah Johnson', story: 'Thanks to the donations, I was able to complete my education and now work as a teacher.', impact: 'Education completed', category: 'education', timestamp: '2024-01-10' },
        { id: '2', name: 'Michael Chen', story: 'The medical treatment I received changed my life completely.', impact: 'Health restored', category: 'healthcare', timestamp: '2024-01-12' },
      ];

      setDonationData(mockDonations);
      setProjectData(mockProjects);
      setBeneficiaryStories(mockStories);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const filteredDonations = donationData.filter((donation: DonationData) => {
    if (categoryFilter !== 'all' && donation.category !== categoryFilter) return false;
    // Add time filtering logic here
    return true;
  });

  const totalDonated = filteredDonations.reduce((sum: number, donation: DonationData) => sum + donation.amount, 0);
  const totalBeneficiaries = projectData.reduce((sum: number, project: ProjectData) => sum + project.beneficiaries, 0);
  const activeProjects = projectData.filter((project: ProjectData) => project.status === 'active').length;

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [20000, 45000, 28000, 80000, 99000, 43000],
    }],
  };

  const categoryData = [
    { name: 'Education', amount: 150000, color: colors.primary, legendFontColor: colors.text.primary },
    { name: 'Healthcare', amount: 120000, color: colors.success, legendFontColor: colors.text.primary },
    { name: 'Environment', amount: 80000, color: colors.info, legendFontColor: colors.text.primary },
    { name: 'Poverty', amount: 60000, color: colors.warning, legendFontColor: colors.text.primary },
  ];

  const renderTimeFilter = () => (
    <View style={styles.filterContainer}>
      {(['7d', '30d', '90d', '1y', 'all'] as TimeFilter[]).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[styles.filterButton, timeFilter === filter && styles.filterButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setTimeFilter(filter);
          }}
        >
          <Text style={[styles.filterText, timeFilter === filter && styles.filterTextActive]}>
            {filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : filter === '90d' ? '90 Days' : filter === '1y' ? '1 Year' : 'All Time'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
      {(['all', 'education', 'healthcare', 'environment', 'poverty', 'emergency'] as CategoryFilter[]).map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryButton, categoryFilter === category && styles.categoryButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setCategoryFilter(category);
          }}
        >
          <Text style={[styles.categoryText, categoryFilter === category && styles.categoryTextActive]}>
            {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading impact data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Impact Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track your charitable contributions</Text>
        </View>

        {/* Time Filter */}
        {renderTimeFilter()}

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <LinearGradient colors={[colors.primary + '20', colors.primary + '10']} style={styles.metricGradient}>
              <Icon name="attach-money" size={32} color={colors.primary} />
              <Text style={styles.metricValue}>₦{totalDonated.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Donated</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient colors={[colors.success + '20', colors.success + '10']} style={styles.metricGradient}>
              <Icon name="people" size={32} color={colors.success} />
              <Text style={styles.metricValue}>{totalBeneficiaries}</Text>
              <Text style={styles.metricLabel}>Beneficiaries Helped</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient colors={[colors.info + '20', colors.info + '10']} style={styles.metricGradient}>
              <Icon name="business" size={32} color={colors.info} />
              <Text style={styles.metricValue}>{activeProjects}</Text>
              <Text style={styles.metricLabel}>Active Projects</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Donation Trends Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Donation Trends</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.primary,
                labelColor: (opacity = 1) => colors.text.primary,
                style: { borderRadius: 16 },
                propsForDots: { r: '6', strokeWidth: '2', stroke: colors.primary },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Donations by Category</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={categoryData}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                color: (opacity = 1) => colors.primary,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Project Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Progress</Text>
          {projectData.map((project: ProjectData) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectCategory}>{project.category}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(project.totalRaised / project.goal) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  ₦{project.totalRaised.toLocaleString()} / ₦{project.goal.toLocaleString()}
                </Text>
              </View>

              <View style={styles.projectStats}>
                <Text style={styles.projectStat}>{project.beneficiaries} beneficiaries</Text>
                <View style={[styles.statusBadge, { backgroundColor: project.status === 'completed' ? colors.success : colors.primary }]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Beneficiary Stories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficiary Stories</Text>
          {beneficiaryStories.map((story: BeneficiaryStory) => (
            <View key={story.id} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyName}>{story.name}</Text>
                <Text style={styles.storyCategory}>{story.category}</Text>
              </View>
              <Text style={styles.storyText} numberOfLines={3}>{story.story}</Text>
              <Text style={styles.storyImpact}>{story.impact}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  categoryFilter: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.white,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  chartSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  projectCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    flex: 1,
  },
  projectCategory: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectStat: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  storyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storyName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  storyCategory: {
    ...typography.caption,
    color: colors.success,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  storyText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  storyImpact: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
});

export default DonationImpactDashboardScreen;