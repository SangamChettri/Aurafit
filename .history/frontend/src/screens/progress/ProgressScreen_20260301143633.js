import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApi } from '../../hooks/useApi';
import progressApi from '../../api/progressApi';
import {
  Card,
  GradientButton,
  StatCard,
  LoadingOverlay,
} from '../../components/common';
import theme from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Professional Progress Screen
 * Charts and analytics with modern design
 */
const ProgressScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [chartType, setChartType] = useState('workouts');

  // Progress data hooks
  const {
    data: weeklyData,
    loading: weeklyLoading,
    execute: fetchWeeklyProgress,
  } = useApi(() => progressApi.getWeeklyProgress(12), { immediate: true });

  const {
    data: monthlyData,
    loading: monthlyLoading,
    execute: fetchMonthlyProgress,
  } = useApi(() => progressApi.getMonthlyProgress(6), { immediate: true });

  const {
    data: volumeData,
    loading: volumeLoading,
    execute: fetchVolumeTrend,
  } = useApi(() => progressApi.getVolumeTrend(selectedPeriod), { immediate: false });

  const {
    data: summaryData,
    loading: summaryLoading,
    execute: fetchSummary,
  } = useApi(progressApi.getProgressSummary, { immediate: true });

  useEffect(() => {
    if (selectedPeriod === 'week') {
      fetchWeeklyProgress();
    } else {
      fetchMonthlyProgress();
    }
    fetchVolumeTrend();
    fetchSummary();
  }, [selectedPeriod]);

  /**
   * Format chart data
   */
  const formatChartData = () => {
    const data = selectedPeriod === 'week' ? weeklyData?.weeklyData : monthlyData?.monthlyData;
    
    if (!data) return null;

    return {
      labels: data.map((_, index) => 
        selectedPeriod === 'week' ? `W${index + 1}` : `M${index + 1}`
      ),
      datasets: [
        {
          data: data.map(item => 
            chartType === 'workouts' ? item.totalWorkouts : Math.round(item.totalVolume / 1000)
          ),
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = formatChartData();

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '3',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.border,
    },
  };

  const barChartConfig = {
    ...chartConfig,
    fillShadowGradient: theme.colors.primary,
    fillShadowGradientOpacity: 0.4,
  };

  /**
   * Render period selector
   */
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive,
          ]}>
            {period === 'week' ? 'Weekly' : 'Monthly'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * Render chart type selector
   */
  const renderChartTypeSelector = () => (
    <View style={styles.chartTypeSelector}>
      {['workouts', 'volume'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.chartTypeButton,
            chartType === type && styles.chartTypeButtonActive,
          ]}
          onPress={() => setChartType(type)}
        >
          <Text style={[
            styles.chartTypeButtonText,
            chartType === type && styles.chartTypeButtonTextActive,
          ]}>
            {type === 'workouts' ? 'Workouts' : 'Volume'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * Render chart
   */
  const renderChart = () => {
    if (!chartData) return null;

    return (
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {chartType === 'workouts' ? 'Workout Count' : 'Volume Progress'}
          </Text>
          <Text style={styles.chartSubtitle}>
            Last {selectedPeriod === 'week' ? '12 weeks' : '6 months'}
          </Text>
        </View>
        
        {chartType === 'workouts' ? (
          <LineChart
            data={chartData}
            width={screenWidth - theme.spacing['3xl']}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <BarChart
            data={chartData}
            width={screenWidth - theme.spacing['3xl']}
            height={220}
            chartConfig={barChartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        )}
      </Card>
    );
  };

  /**
   * Render stats grid
   */
  const renderStatsGrid = () => {
    if (!summaryData?.summary) return null;

    return (
      <View style={styles.statsGrid}>
        <StatCard
          icon="🏋️‍♂️"
          value={summaryData.summary.totalWorkouts}
          label="Total Workouts"
          variant="primary"
          size="md"
        />
        <StatCard
          icon="💪"
          value={`${Math.round(summaryData.summary.totalVolume / 1000)}k`}
          label="Total Volume"
          variant="success"
          size="md"
        />
        <StatCard
          icon="📈"
          value={summaryData.summary.workoutsPerWeek?.toFixed(1)}
          label="Workouts/Week"
          variant="warning"
          size="md"
        />
        <StatCard
          icon="🎯"
          value={summaryData.summary.uniqueExercises}
          label="Exercises"
          variant="default"
          size="md"
        />
      </View>
    );
  };

  /**
   * Render progress indicators
   */
  const renderProgressIndicators = () => {
    if (!summaryData?.progressIndicators) return null;

    const indicators = summaryData.progressIndicators;

    return (
      <Card style={styles.indicatorsCard}>
        <Text style={styles.sectionTitle}>Progress Indicators</Text>
        
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Consistency</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${indicators.consistency}%` }
                ]} 
              />
            </View>
            <Text style={styles.indicatorValue}>
              {Math.round(indicators.consistency)}%
            </Text>
          </View>
          
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Volume Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${indicators.volumeProgress}%`,
                    backgroundColor: theme.colors.success
                  }
                ]} 
              />
            </View>
            <Text style={styles.indicatorValue}>
              {Math.round(indicators.volumeProgress)}%
            </Text>
          </View>
          
          <View style={styles.indicator}>
            <Text style={styles.indicatorLabel}>Streak Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${indicators.streakProgress}%`,
                    backgroundColor: theme.colors.warning
                  }
                ]} 
              />
            </View>
            <Text style={styles.indicatorValue}>
              {Math.round(indicators.streakProgress)}%
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const isLoading = weeklyLoading || monthlyLoading || volumeLoading || summaryLoading;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>

        {/* Period and Chart Type Selectors */}
        {renderPeriodSelector()}
        {renderChartTypeSelector()}

        {/* Chart */}
        {renderChart()}

        {/* Stats Grid */}
        {renderStatsGrid()}

        {/* Progress Indicators */}
        {renderProgressIndicators()}

        {/* Action Button */}
        <GradientButton
          title="View Detailed Analytics"
          onPress={() => navigation.navigate('DetailedAnalytics')}
          style={styles.actionButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  periodButtonTextActive: {
    color: theme.colors.text,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  chartTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  chartTypeButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.textSecondary,
  },
  chartTypeButtonTextActive: {
    color: theme.colors.text,
  },
  chartCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  chartHeader: {
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  chartSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  indicatorsCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  indicatorContainer: {
    gap: theme.spacing.lg,
  },
  indicator: {
    gap: theme.spacing.sm,
  },
  indicatorLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  indicatorValue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  actionButton: {
    marginBottom: theme.spacing['2xl'],
  },
});

export default ProgressScreen;
