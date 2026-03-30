import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, Card, useTheme, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { jobService } from '../../../src/services/jobService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { EmptyState, LoadingScreen } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';
import type { Job } from '../../../src/types';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 1 },
  { label: 'Draft', value: 0 },
  { label: 'Paused', value: 2 },
  { label: 'Closed', value: 3 },
];

export default function JobsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['jobs', search, statusFilter],
    queryFn: () => jobService.getJobs({ search, status: statusFilter, pageSize: 50 }),
  });

  const renderJob = ({ item }: { item: Job }) => (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/(tabs)/jobs/${item.id}`)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {item.department} {item.location ? `• ${item.location}` : ''}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardStat}>
            <MaterialCommunityIcons name="account-multiple" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {item.candidateCount} applicants
            </Text>
          </View>
          <View style={styles.cardStat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {item.postedDate ? new Date(item.postedDate).toLocaleDateString() : 'Not posted'}
            </Text>
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
            {item.jobType}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search jobs..."
          onChangeText={setSearch}
          value={search}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => (
          <Chip
            key={filter.label}
            selected={statusFilter === filter.value}
            onPress={() => setStatusFilter(filter.value)}
            style={[styles.chip, statusFilter === filter.value && { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ fontSize: 12 }}
            compact
          >
            {filter.label}
          </Chip>
        ))}
      </View>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={<EmptyState message="No jobs found" icon="💼" />}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => router.push('/(tabs)/jobs/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  searchbar: { elevation: 2, borderRadius: 12 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: { height: 32 },
  list: { padding: spacing.lg, paddingBottom: 80 },
  card: {
    marginBottom: spacing.md,
    borderRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardStat: { flexDirection: 'row', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    borderRadius: 16,
  },
});
