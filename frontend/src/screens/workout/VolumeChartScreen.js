import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import workoutApi from '../../api/workoutApi';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

const VolumeChartScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [labels, setLabels] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    fetchVolumeData();
  }, []);

  const fetchVolumeData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await workoutApi.getVolumeHistory();
      if (response.success && response.data && response.data.length > 0) {
        
        // Extract up to 10 most recent for the chart to not overcrowd the x-axis
        const recentData = response.data.slice(-10);
        
        const chartLabels = recentData.map(workout => format(new Date(workout.date), 'MMM dd'));
        const chartData = recentData.map(workout => parseFloat(workout.totalVolume) || 0);
        
        setLabels(chartLabels);
        setDataPoints(chartData);
      } else if (response.success && response.data?.length === 0) {
         setLabels([]);
         setDataPoints([]);
      } else {
        setError(response.error || 'Failed to fetch volume data');
      }
    } catch (err) {
      setError('An error occurred while fetching chart data');
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, // Blue matching active tint
    strokeWidth: 3, 
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#0ea5e9"
    },
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Strength Progress</Text>
        <View style={{ width: 60 }} /> {/* Placeholder for alignment */}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Total Workout Volume (kg)</Text>
        <Text style={styles.description}>
          Track your overall weight lifted per session to see your strength progress over time.
        </Text>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.stateText}>Loading chart data...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchVolumeData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : dataPoints.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.emptyIcon}>📉</Text>
            <Text style={styles.stateText}>No volume data available yet.</Text>
            <Text style={styles.description}>Log a workout with exercises and weights to see your progress!</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: dataPoints,
                    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, 
                    strokeWidth: 3
                  }
                ]
              }}
              width={screenWidth - 40}
              height={260}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=" kg"
              fromZero={true}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});

export default VolumeChartScreen;
