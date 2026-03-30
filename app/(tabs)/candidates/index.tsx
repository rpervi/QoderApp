import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Card, useTheme, Chip, Avatar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { candidateService } from '../../../src/services/candidateService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { EmptyState, LoadingScreen } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';
import type { Candidate } from '../../../src/types';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Shortlisted', value: 2 },
  { label: 'Rejected', value: 3 },
  { label: 'Interview', value: 4 },
  { label: 'Hired', value: 5 },
];

export default function CandidatesListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['candidates', search, statusFilter],
    queryFn: () => candidateService.getCandidates({ search, status: statusFilter, pageSize: 50 }),
  });

  const renderCandidate = ({ item }: { item: Candidate }) => {
    const initials = item.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
    const latestResume = item.resumes?.[0];

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push(`/(tabs)/candidates/${item.id}`)}
      >
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={44}
            label={initials}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            labelStyle={{ color: theme.colors.primary, fontSize: 16, fontWeight: '700' }}
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardTop}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.onSurface, flex: 1 }}>
                {item.fullName}
              </Text>
              {latestResume && <StatusBadge status={latestResume.status} />}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.currentRole ? `${item.currentRole}` : ''}{item.currentCompany ? ` at ${item.currentCompany}` : ''}
            </Text>
            <View style={styles.cardBottom}>
              {item.experienceYears != null && (
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.experienceYears} yrs exp
                </Text>
              )}
              {latestResume && (
                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                  {latestResume.jobTitle}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search candidates..."
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
          renderItem={renderCandidate}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={<EmptyState message="No candidates found" icon="👥" />}
        />
      )}
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
    flexWrap: 'wrap',
  },
  chip: { height: 32 },
  list: { padding: spacing.lg, paddingBottom: 20 },
  card: { marginBottom: spacing.md, borderRadius: 16, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
