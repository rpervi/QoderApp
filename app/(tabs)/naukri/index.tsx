import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, Divider, Dialog, Portal, List } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { naukriService } from '../../../src/services/naukriService';
import { jobService } from '../../../src/services/jobService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingScreen, EmptyState } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';
import type { NaukriPosting, NaukriResume, Job } from '../../../src/types';

export default function NaukriScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showResumes, setShowResumes] = useState<number | null>(null);

  const { data: postings, isLoading: postingsLoading, refetch } = useQuery({
    queryKey: ['naukri-postings'],
    queryFn: naukriService.getPostings,
  });

  const { data: activeJobs } = useQuery({
    queryKey: ['jobs', 'active-for-naukri'],
    queryFn: () => jobService.getJobs({ status: 1, pageSize: 50 }),
  });

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['naukri-resumes', showResumes],
    queryFn: () => naukriService.getResumesForPosting(showResumes!),
    enabled: !!showResumes,
  });

  const postMutation = useMutation({
    mutationFn: (jobId: number) => naukriService.postJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naukri-postings'] });
      setShowPostDialog(false);
    },
  });

  const syncMutation = useMutation({
    mutationFn: (postingId: number) => naukriService.syncPosting(postingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naukri-postings'] });
    },
  });

  if (postingsLoading) return <LoadingScreen />;

  const postedJobIds = new Set(postings?.map(p => p.jobId) || []);
  const unpostedJobs = activeJobs?.items.filter(j => !postedJobIds.has(j.id)) || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      {/* Post to Naukri Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="upload" size={22} color={theme.colors.primary} />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginLeft: spacing.sm }}>Post to Naukri</Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.lg }}>
          Post your active job openings to Naukri job portal (Mock)
        </Text>
        <Button mode="contained" onPress={() => setShowPostDialog(true)} icon="plus" style={styles.postBtn}
          disabled={unpostedJobs.length === 0}>
          Post a Job ({unpostedJobs.length} available)
        </Button>
      </View>

      {/* Posted Jobs */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="briefcase-check" size={22} color="#16A34A" />
          <Text variant="titleMedium" style={{ fontWeight: '700', marginLeft: spacing.sm }}>Posted Jobs</Text>
        </View>

        {postings && postings.length > 0 ? (
          postings.map((posting, i) => (
            <View key={posting.id}>
              {i > 0 && <Divider style={{ marginVertical: spacing.md }} />}
              <View style={styles.postingItem}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{posting.jobTitle}</Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    Code: {posting.naukriJobCode}
                  </Text>
                  <View style={styles.postingStats}>
                    <View style={styles.postingStat}>
                      <MaterialCommunityIcons name="file-document-multiple" size={14} color={theme.colors.primary} />
                      <Text variant="labelSmall" style={{ marginLeft: 4, color: theme.colors.primary, fontWeight: '600' }}>
                        {posting.responseCount} responses
                      </Text>
                    </View>
                    <StatusBadge status={posting.status} />
                  </View>
                </View>
                <View style={styles.postingActions}>
                  <Button compact mode="text" onPress={() => syncMutation.mutate(posting.id)}
                    loading={syncMutation.isPending} icon="sync">Sync</Button>
                  <Button compact mode="text" onPress={() => setShowResumes(posting.id)} icon="file-eye">
                    Resumes
                  </Button>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState message="No jobs posted to Naukri yet" icon="📤" />
        )}
      </View>

      {/* Incoming Resumes Section */}
      {showResumes && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface, marginBottom: spacing.xxxl }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="file-download" size={22} color="#7C3AED" />
            <Text variant="titleMedium" style={{ fontWeight: '700', marginLeft: spacing.sm }}>
              Resumes from Naukri
            </Text>
            <Button compact mode="text" onPress={() => setShowResumes(null)} style={{ marginLeft: 'auto' }}>Close</Button>
          </View>

          {resumesLoading ? (
            <LoadingScreen />
          ) : resumes && resumes.length > 0 ? (
            resumes.map((resume, i) => (
              <View key={i}>
                {i > 0 && <Divider style={{ marginVertical: spacing.sm }} />}
                <View style={styles.resumeCard}>
                  <Avatar.Text size={36}
                    label={resume.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    style={{ backgroundColor: '#EDE9FE' }}
                    labelStyle={{ color: '#7C3AED', fontSize: 14 }} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{resume.candidateName}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {resume.currentRole} at {resume.currentCompany}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {resume.experienceYears} yrs • {resume.email}
                    </Text>
                  </View>
                  <Button compact mode="outlined" onPress={() => {}} icon="import" style={{ borderRadius: 8 }}>
                    Import
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <EmptyState message="No resumes found" icon="📄" />
          )}
        </View>
      )}

      {/* Post Job Dialog */}
      <Portal>
        <Dialog visible={showPostDialog} onDismiss={() => setShowPostDialog(false)}>
          <Dialog.Title>Select Job to Post</Dialog.Title>
          <Dialog.Content>
            {unpostedJobs.length > 0 ? (
              unpostedJobs.map((job) => (
                <List.Item
                  key={job.id}
                  title={job.title}
                  description={`${job.department || ''} • ${job.location || ''}`}
                  left={(props) => <List.Icon {...props} icon="briefcase" />}
                  onPress={() => postMutation.mutate(job.id)}
                  style={{ paddingVertical: 4 }}
                />
              ))
            ) : (
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#64748B' }}>
                All active jobs have been posted
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPostDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postBtn: { borderRadius: 12 },
  postingItem: { paddingVertical: spacing.sm },
  postingStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  postingStat: { flexDirection: 'row', alignItems: 'center' },
  postingActions: { flexDirection: 'row', marginTop: spacing.sm },
  resumeCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
});
