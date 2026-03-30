import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../../src/services/jobService';
import { spacing } from '../../../src/theme';

const JOB_TYPES = [
  { value: '0', label: 'Full Time' },
  { value: '1', label: 'Part Time' },
  { value: '2', label: 'Contract' },
  { value: '3', label: 'Internship' },
  { value: '4', label: 'Remote' },
];

export default function CreateJobScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: '0',
    experienceMin: '',
    experienceMax: '',
    skills: '',
  });
  const [error, setError] = useState('');

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: (status: number) =>
      jobService.createJob({
        title: form.title,
        description: form.description || undefined,
        department: form.department || undefined,
        location: form.location || undefined,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        jobType: parseInt(form.jobType),
        experienceMin: form.experienceMin ? parseInt(form.experienceMin) : undefined,
        experienceMax: form.experienceMax ? parseInt(form.experienceMax) : undefined,
        skills: form.skills || undefined,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create job.');
    },
  });

  const handleSave = (status: number) => {
    if (!form.title.trim()) {
      setError('Job title is required');
      return;
    }
    createMutation.mutate(status);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Basic Information
        </Text>
        <TextInput label="Job Title *" value={form.title} onChangeText={(v) => updateForm('title', v)} mode="outlined" style={styles.input} />
        <TextInput label="Department" value={form.department} onChangeText={(v) => updateForm('department', v)} mode="outlined" style={styles.input} />
        <TextInput label="Location" value={form.location} onChangeText={(v) => updateForm('location', v)} mode="outlined" style={styles.input} />

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Job Type
        </Text>
        <SegmentedButtons
          value={form.jobType}
          onValueChange={(v) => updateForm('jobType', v)}
          buttons={JOB_TYPES}
          style={styles.segment}
        />

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Description
        </Text>
        <TextInput label="Job Description" value={form.description} onChangeText={(v) => updateForm('description', v)} mode="outlined" multiline numberOfLines={5} style={styles.input} />

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Requirements
        </Text>
        <TextInput label="Skills (comma separated)" value={form.skills} onChangeText={(v) => updateForm('skills', v)} mode="outlined" placeholder="React Native, TypeScript, Node.js" style={styles.input} />
        <View style={styles.row}>
          <TextInput label="Min Exp (Years)" value={form.experienceMin} onChangeText={(v) => updateForm('experienceMin', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
          <TextInput label="Max Exp (Years)" value={form.experienceMax} onChangeText={(v) => updateForm('experienceMax', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
        </View>

        <Text variant="titleMedium" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Compensation
        </Text>
        <View style={styles.row}>
          <TextInput label="Min Salary (INR)" value={form.salaryMin} onChangeText={(v) => updateForm('salaryMin', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
          <TextInput label="Max Salary (INR)" value={form.salaryMax} onChangeText={(v) => updateForm('salaryMax', v)} mode="outlined" keyboardType="numeric" style={[styles.input, styles.halfInput]} />
        </View>

        {error ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginBottom: spacing.md }}>{error}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <Button mode="outlined" onPress={() => handleSave(0)} loading={createMutation.isPending} style={styles.btn} icon="content-save-outline">
            Save as Draft
          </Button>
          <Button mode="contained" onPress={() => handleSave(1)} loading={createMutation.isPending} style={styles.btn} icon="publish">
            Publish
          </Button>
        </View>
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
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  btn: { flex: 1, borderRadius: 12 },
});
