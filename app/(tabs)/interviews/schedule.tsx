import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '../../../src/services/interviewService';
import { spacing } from '../../../src/theme';

const INTERVIEW_TYPES = [
  { value: '0', label: 'Phone' },
  { value: '1', label: 'Video' },
  { value: '2', label: 'In-Person' },
  { value: '3', label: 'Technical' },
  { value: '4', label: 'HR' },
  { value: '5', label: 'Final' },
];

export default function ScheduleInterviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    interviewDate: '',
    interviewTime: '',
    duration: '60',
    interviewType: '1',
    meetingLink: '',
    interviewerName: '',
    interviewerEmail: '',
    notes: '',
  });
  const [error, setError] = useState('');

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const scheduleMutation = useMutation({
    mutationFn: () =>
      interviewService.scheduleInterview({
        candidateId: parseInt(form.candidateId),
        jobId: parseInt(form.jobId),
        interviewDate: form.interviewDate,
        interviewTime: form.interviewTime,
        duration: parseInt(form.duration),
        interviewType: parseInt(form.interviewType),
        meetingLink: form.meetingLink || undefined,
        interviewerName: form.interviewerName || undefined,
        interviewerEmail: form.interviewerEmail || undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to schedule interview.');
    },
  });

  const handleSchedule = () => {
    if (!form.candidateId || !form.jobId || !form.interviewDate || !form.interviewTime) {
      setError('Candidate ID, Job ID, Date, and Time are required');
      return;
    }
    scheduleMutation.mutate();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Interview Details
        </Text>

        <View style={styles.row}>
          <TextInput label="Candidate ID *" value={form.candidateId} onChangeText={(v) => updateForm('candidateId', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
          <TextInput label="Job ID *" value={form.jobId} onChangeText={(v) => updateForm('jobId', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
        </View>

        <TextInput label="Date * (YYYY-MM-DD)" value={form.interviewDate} onChangeText={(v) => updateForm('interviewDate', v)} mode="outlined" placeholder="2026-04-15" style={styles.input} />

        <View style={styles.row}>
          <TextInput label="Time * (HH:MM)" value={form.interviewTime} onChangeText={(v) => updateForm('interviewTime', v)} mode="outlined" placeholder="10:00" style={[styles.input, styles.halfInput]} />
          <TextInput label="Duration (min)" value={form.duration} onChangeText={(v) => updateForm('duration', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
        </View>

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Interview Type
        </Text>
        <SegmentedButtons
          value={form.interviewType}
          onValueChange={(v) => updateForm('interviewType', v)}
          buttons={INTERVIEW_TYPES.slice(0, 4)}
          style={styles.segment}
        />

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Interviewer
        </Text>
        <TextInput label="Interviewer Name" value={form.interviewerName} onChangeText={(v) => updateForm('interviewerName', v)} mode="outlined" style={styles.input} />
        <TextInput label="Interviewer Email" value={form.interviewerEmail} onChangeText={(v) => updateForm('interviewerEmail', v)} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput label="Meeting Link" value={form.meetingLink} onChangeText={(v) => updateForm('meetingLink', v)} mode="outlined" placeholder="https://meet.google.com/..." style={styles.input} />

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Notes
        </Text>
        <TextInput label="Notes" value={form.notes} onChangeText={(v) => updateForm('notes', v)} mode="outlined" multiline numberOfLines={3} style={styles.input} />

        {error ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: spacing.md }}>{error}</Text>
        ) : null}

        <Button mode="contained" onPress={handleSchedule} loading={scheduleMutation.isPending} style={styles.button} contentStyle={{ paddingVertical: 6 }} icon="calendar-plus">
          Schedule Interview
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  sectionLabel: { fontWeight: '600', marginTop: spacing.xl, marginBottom: spacing.md },
  input: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  segment: { marginBottom: spacing.md },
  button: { marginTop: spacing.xl, borderRadius: 12 },
});
