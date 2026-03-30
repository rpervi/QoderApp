import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, useTheme, Avatar, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { jobService } from '../../../src/services/jobService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingScreen } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(Number(id)),
  });

  const statusMutation = useMutation({
    mutationFn: (status: number) => jobService.changeStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  if (isLoading || !job) return <LoadingScreen />;

  const skills = job.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onSurface, flex: 1 }}>
              {job.title}
            </Text>
            <StatusBadge status={job.status} size="medium" />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="domain" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.metaText}>{job.department || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.metaText}>{job.location || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="briefcase-variant" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.metaText}>{job.jobType}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.statValue, { color: '#2563EB' }]}>{job.candidateCount}</Text>
              <Text style={styles.statLabel}>Applicants</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statValue, { color: '#D97706' }]}>
                {job.experienceMin || 0}-{job.experienceMax || 0}
              </Text>
              <Text style={styles.statLabel}>Exp (Yrs)</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>
                {job.salaryMin ? `${(job.salaryMin / 100000).toFixed(0)}L` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Min Salary</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Description</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>
            {job.description || 'No description provided.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Skills */}
      {skills.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Required Skills</Text>
            <View style={styles.chipContainer}>
              {skills.map((skill: string, i: number) => (
                <Chip key={i} style={styles.skillChip} textStyle={{ fontSize: 12 }} compact>{skill}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Details */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Details</Text>
          <DetailRow label="Posted" value={job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Not posted'} />
          <DetailRow label="Closing" value={job.closingDate ? new Date(job.closingDate).toLocaleDateString() : 'Not set'} />
          <DetailRow label="Created By" value={job.createdByName} />
          <DetailRow label="Salary Range" value={
            job.salaryMin && job.salaryMax
              ? `${(job.salaryMin / 100000).toFixed(1)}L - ${(job.salaryMax / 100000).toFixed(1)}L`
              : 'Not specified'
          } />
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        {job.status === 'Draft' && (
          <Button mode="contained" onPress={() => statusMutation.mutate(1)} loading={statusMutation.isPending}
            style={styles.actionBtn} icon="publish">Publish</Button>
        )}
        {job.status === 'Active' && (
          <Button mode="contained" onPress={() => statusMutation.mutate(2)} loading={statusMutation.isPending}
            style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]} icon="pause">Pause</Button>
        )}
        {job.status === 'Paused' && (
          <Button mode="contained" onPress={() => statusMutation.mutate(1)} loading={statusMutation.isPending}
            style={styles.actionBtn} icon="play">Resume</Button>
        )}
        <Button mode="outlined" onPress={() => router.push(`/(tabs)/jobs/create?editId=${job.id}`)}
          style={styles.actionBtn} icon="pencil">Edit</Button>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text variant="bodySmall" style={{ color: '#64748B' }}>{label}</Text>
      <Text variant="bodySmall" style={{ fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: spacing.lg, marginBottom: 0, borderRadius: 16, elevation: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 4, color: '#64748B' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: { height: 30 },
  actions: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  actionBtn: { borderRadius: 12 },
});
