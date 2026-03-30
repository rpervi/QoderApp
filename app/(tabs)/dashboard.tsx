import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Avatar, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { dashboardService } from '../../src/services/dashboardService';
import { useAuthStore } from '../../src/stores/authStore';
import { StatCard } from '../../src/components/ui/StatCard';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { spacing, colors } from '../../src/theme';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getSummary,
  });

  if (isLoading) return <LoadingScreen />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar.Text
              size={44}
              label={user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.headerText}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {greeting()},
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
                {user?.fullName}
              </Text>
            </View>
          </View>
          <IconButton
            icon="logout"
            iconColor={theme.colors.onSurfaceVariant}
            onPress={logout}
          />
        </View>

        {/* KPI Cards */}
        <View style={styles.statsRow}>
          <StatCard
            title="Active Jobs"
            value={data?.jobStats.totalActiveJobs || 0}
            subtitle={`+${data?.jobStats.newJobsThisWeek || 0} this week`}
            icon="briefcase-check"
            color="#2563EB"
            bgColor="#DBEAFE"
          />
          <StatCard
            title="Resumes"
            value={data?.candidatePipeline.totalReceived || 0}
            subtitle={`${data?.candidatePipeline.shortlisted || 0} shortlisted`}
            icon="file-document-multiple"
            color="#16A34A"
            bgColor="#DCFCE7"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Interviews Today"
            value={data?.interviewTracker.todayCount || 0}
            subtitle={`${data?.interviewTracker.upcomingCount || 0} upcoming`}
            icon="calendar-check"
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
          <StatCard
            title="Total Hired"
            value={data?.hiringMetrics.totalHired || 0}
            subtitle={`${data?.hiringMetrics.offerAcceptanceRate || 0}% acceptance`}
            icon="account-check"
            color="#7C3AED"
            bgColor="#EDE9FE"
          />
        </View>

        {/* Candidate Pipeline */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Candidate Pipeline
          </Text>
          <View style={styles.pipelineRow}>
            {[
              { label: 'Received', value: data?.candidatePipeline.totalReceived || 0, color: '#2563EB' },
              { label: 'Reviewing', value: data?.candidatePipeline.underReview || 0, color: '#F59E0B' },
              { label: 'Shortlisted', value: data?.candidatePipeline.shortlisted || 0, color: '#16A34A' },
              { label: 'Interview', value: data?.candidatePipeline.interviewScheduled || 0, color: '#7C3AED' },
              { label: 'Hired', value: data?.candidatePipeline.hired || 0, color: '#0891B2' },
            ].map((item, i) => (
              <View key={i} style={styles.pipelineItem}>
                <Text variant="titleLarge" style={{ fontWeight: '700', color: item.color }}>
                  {item.value}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
          {/* Pipeline bar */}
          <View style={styles.pipelineBar}>
            {(() => {
              const total = data?.candidatePipeline.totalReceived || 1;
              const segments = [
                { value: data?.candidatePipeline.totalReceived || 0, color: '#2563EB' },
                { value: data?.candidatePipeline.underReview || 0, color: '#F59E0B' },
                { value: data?.candidatePipeline.shortlisted || 0, color: '#16A34A' },
                { value: data?.candidatePipeline.interviewScheduled || 0, color: '#7C3AED' },
                { value: data?.candidatePipeline.hired || 0, color: '#0891B2' },
              ];
              return segments.map((seg, i) => (
                <View
                  key={i}
                  style={{
                    flex: Math.max(seg.value / total, 0.05),
                    height: 8,
                    backgroundColor: seg.color,
                    borderTopLeftRadius: i === 0 ? 4 : 0,
                    borderBottomLeftRadius: i === 0 ? 4 : 0,
                    borderTopRightRadius: i === segments.length - 1 ? 4 : 0,
                    borderBottomRightRadius: i === segments.length - 1 ? 4 : 0,
                  }}
                />
              ));
            })()}
          </View>
        </View>

        {/* Upcoming Interviews */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Upcoming Interviews
          </Text>
          {data?.upcomingInterviews.length ? (
            data.upcomingInterviews.map((interview, i) => (
              <View key={i}>
                {i > 0 && <Divider style={{ marginVertical: spacing.sm }} />}
                <View style={styles.interviewItem}>
                  <View style={styles.interviewLeft}>
                    <Avatar.Text
                      size={36}
                      label={interview.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      style={{ backgroundColor: theme.colors.primaryContainer }}
                      labelStyle={{ color: theme.colors.primary, fontSize: 14 }}
                    />
                    <View style={{ marginLeft: spacing.md, flex: 1 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                        {interview.candidateName}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {interview.jobTitle}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                      {interview.interviewTime}
                    </Text>
                    <StatusBadge status={interview.interviewType} />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: spacing.xl }}>
              No upcoming interviews
            </Text>
          )}
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, marginBottom: spacing.xxl }]}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recent Activity
          </Text>
          {data?.recentActivities.length ? (
            data.recentActivities.slice(0, 5).map((activity, i) => (
              <View key={i}>
                {i > 0 && <Divider style={{ marginVertical: spacing.sm }} />}
                <View style={styles.activityItem}>
                  <MaterialCommunityIcons
                    name={activity.type === 'job' ? 'briefcase-plus' : activity.type === 'resume' ? 'file-account' : 'calendar-check'}
                    size={20}
                    color={activity.type === 'job' ? '#2563EB' : activity.type === 'resume' ? '#16A34A' : '#F59E0B'}
                  />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                      {activity.description}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: spacing.xl }}>
              No recent activity
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: spacing.md },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
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
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  pipelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pipelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  pipelineBar: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  interviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  interviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
