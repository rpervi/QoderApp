import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, useTheme, Avatar, Dialog, Portal, TextInput } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { candidateService } from '../../../src/services/candidateService';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { LoadingScreen } from '../../../src/components/ui/LoadingScreen';
import { spacing } from '../../../src/theme';

export default function CandidateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [showCommDialog, setShowCommDialog] = useState(false);
  const [commForm, setCommForm] = useState({ subject: '', body: '', type: 0 });

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidateService.getCandidate(Number(id)),
  });

  const { data: communications } = useQuery({
    queryKey: ['communications', id],
    queryFn: () => candidateService.getCommunications(Number(id)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ resumeId, status, remarks }: { resumeId: number; status: number; remarks?: string }) =>
      candidateService.updateResumeStatus(Number(id), resumeId, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const commMutation = useMutation({
    mutationFn: () => candidateService.sendCommunication(Number(id), {
      type: commForm.type,
      subject: commForm.subject,
      body: commForm.body,
      jobId: candidate?.resumes?.[0]?.jobId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications', id] });
      setShowCommDialog(false);
      setCommForm({ subject: '', body: '', type: 0 });
    },
  });

  if (isLoading || !candidate) return <LoadingScreen />;

  const initials = candidate.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const skills = candidate.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text size={56} label={initials} style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ color: theme.colors.primary, fontSize: 20, fontWeight: '700' }} />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={{ fontWeight: '700' }}>{candidate.fullName}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {candidate.currentRole}{candidate.currentCompany ? ` at ${candidate.currentCompany}` : ''}
              </Text>
              {candidate.experienceYears != null && (
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600', marginTop: 2 }}>
                  {candidate.experienceYears} years experience
                </Text>
              )}
            </View>
          </View>

          <Divider style={{ marginVertical: spacing.lg }} />

          <View style={styles.contactRow}>
            {candidate.email && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="email-outline" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>{candidate.email}</Text>
              </View>
            )}
            {candidate.phone && (
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="phone-outline" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>{candidate.phone}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Skills */}
      {skills.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Skills</Text>
            <View style={styles.chipContainer}>
              {skills.map((skill, i) => (
                <Chip key={i} compact style={styles.skillChip} textStyle={{ fontSize: 12 }}>{skill}</Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Resumes / Applications */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Applications</Text>
          {candidate.resumes.map((resume, i) => (
            <View key={resume.id}>
              {i > 0 && <Divider style={{ marginVertical: spacing.md }} />}
              <View style={styles.resumeItem}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{resume.jobTitle}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {resume.source} • {new Date(resume.submittedAt).toLocaleDateString()}
                  </Text>
                  {resume.remarks && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, fontStyle: 'italic' }}>
                      "{resume.remarks}"
                    </Text>
                  )}
                </View>
                <StatusBadge status={resume.status} />
              </View>
              <View style={styles.resumeActions}>
                <Button compact mode="text" textColor="#16A34A" onPress={() => statusMutation.mutate({ resumeId: resume.id, status: 2 })}
                  disabled={resume.status === 'Shortlisted' || resume.status === 'Hired'} icon="check">
                  Shortlist
                </Button>
                <Button compact mode="text" textColor="#DC2626" onPress={() => statusMutation.mutate({ resumeId: resume.id, status: 3 })}
                  disabled={resume.status === 'Rejected'} icon="close">
                  Reject
                </Button>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Communication History */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>Communications</Text>
            <Button compact mode="text" onPress={() => setShowCommDialog(true)} icon="email-plus">Send</Button>
          </View>
          {communications && communications.length > 0 ? (
            communications.map((comm, i) => (
              <View key={comm.id}>
                {i > 0 && <Divider style={{ marginVertical: spacing.sm }} />}
                <View style={{ paddingVertical: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="bodySmall" style={{ fontWeight: '600' }}>{comm.subject || comm.type}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {new Date(comm.sentAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }} numberOfLines={2}>
                    {comm.body}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingVertical: spacing.lg }}>
              No communications yet
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Notes */}
      {candidate.notes && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginBottom: spacing.xxxl }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: spacing.md }}>Notes</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{candidate.notes}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Communication Dialog */}
      <Portal>
        <Dialog visible={showCommDialog} onDismiss={() => setShowCommDialog(false)}>
          <Dialog.Title>Send Communication</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Subject" value={commForm.subject} onChangeText={(v) => setCommForm({ ...commForm, subject: v })} mode="outlined" style={{ marginBottom: spacing.md }} />
            <TextInput label="Message" value={commForm.body} onChangeText={(v) => setCommForm({ ...commForm, body: v })} mode="outlined" multiline numberOfLines={4} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCommDialog(false)}>Cancel</Button>
            <Button onPress={() => commMutation.mutate()} loading={commMutation.isPending}>Send</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: spacing.lg, marginBottom: 0, borderRadius: 16, elevation: 2 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { marginLeft: spacing.lg, flex: 1 },
  contactRow: { gap: spacing.sm },
  contactItem: { flexDirection: 'row', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: { height: 30 },
  resumeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resumeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
});
