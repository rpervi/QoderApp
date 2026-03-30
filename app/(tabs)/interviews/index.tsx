import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Chip, FAB, Avatar, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { interviewService } from '../../../src/services/interviewService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { EmptyState, LoadingScreen } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';
import type { Interview } from '../../../src/types';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Scheduled', value: 0 },
  { label: 'Completed', value: 1 },
  { label: 'Pending Feedback', value: 4 },
  { label: 'Cancelled', value: 2 },
];

const statusColorMap: Record<string, string> = {
  Scheduled: '#2563EB',
  Completed: '#16A34A',
  Cancelled: '#DC2626',
  PendingFeedback: '#F59E0B',
  NoShow: '#DC2626',
};

export default function InterviewsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [feedbackDialog, setFeedbackDialog] = useState<Interview | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['interviews', statusFilter],
    queryFn: () => interviewService.getInterviews({ status: statusFilter, pageSize: 50 }),
  });

  const feedbackMutation = useMutation({
    mutationFn: () => interviewService.submitFeedback(feedbackDialog!.id, {
      feedback,
      rating: rating ? parseInt(rating) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setFeedbackDialog(null);
      setFeedback('');
      setRating('');
    },
  });

  const renderInterview = ({ item }: { item: Interview }) => {
    const accentColor = statusColorMap[item.status] || '#64748B';
    const initials = item.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2);

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: accentColor }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Avatar.Text size={40} label={initials}
              style={{ backgroundColor: `${accentColor}20` }}
              labelStyle={{ color: accentColor, fontSize: 14, fontWeight: '700' }} />
            <View style={styles.cardInfo}>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>{item.candidateName}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.jobTitle}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                {new Date(item.interviewDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                {item.interviewTime} ({item.duration}min)
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="video" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                {item.interviewType}
              </Text>
            </View>
          </View>

          {item.rating && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <MaterialCommunityIcons key={star} name={star <= item.rating! ? 'star' : 'star-outline'}
                  size={16} color={star <= item.rating! ? '#F59E0B' : '#CBD5E1'} />
              ))}
              <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
                ({item.rating}/5)
              </Text>
            </View>
          )}

          {item.status === 'Scheduled' && (
            <View style={styles.cardActions}>
              <Button compact mode="text" onPress={() => setFeedbackDialog(item)} icon="comment-text">
                Feedback
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => (
          <Chip
            key={filter.label}
            selected={statusFilter === filter.value}
            onPress={() => setStatusFilter(filter.value)}
            style={[styles.chip, statusFilter === filter.value && { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ fontSize: 11 }}
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
          renderItem={renderInterview}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={<EmptyState message="No interviews found" icon="📅" />}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => router.push('/(tabs)/interviews/schedule')}
      />

      {/* Feedback Dialog */}
      <Portal>
        <Dialog visible={!!feedbackDialog} onDismiss={() => setFeedbackDialog(null)}>
          <Dialog.Title>Submit Feedback</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ marginBottom: spacing.md, color: theme.colors.onSurfaceVariant }}>
              {feedbackDialog?.candidateName} - {feedbackDialog?.jobTitle}
            </Text>
            <TextInput label="Rating (1-5)" value={rating} onChangeText={setRating} mode="outlined" keyboardType="numeric" style={{ marginBottom: spacing.md }} />
            <TextInput label="Feedback" value={feedback} onChangeText={setFeedback} mode="outlined" multiline numberOfLines={4} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFeedbackDialog(null)}>Cancel</Button>
            <Button onPress={() => feedbackMutation.mutate()} loading={feedbackMutation.isPending}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: { height: 32 },
  list: { padding: spacing.lg, paddingBottom: 80 },
  card: { marginBottom: spacing.md, borderRadius: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
  fab: { position: 'absolute', right: spacing.xl, bottom: spacing.xl, borderRadius: 16 },
});
