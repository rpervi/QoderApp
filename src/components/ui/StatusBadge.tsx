import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { spacing } from '../../theme';

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#DCFCE7', text: '#16A34A' },
  Draft: { bg: '#FEF3C7', text: '#D97706' },
  Paused: { bg: '#FEE2E2', text: '#DC2626' },
  Closed: { bg: '#F1F5F9', text: '#64748B' },
  Filled: { bg: '#EDE9FE', text: '#7C3AED' },
  Scheduled: { bg: '#DBEAFE', text: '#2563EB' },
  Completed: { bg: '#DCFCE7', text: '#16A34A' },
  Cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  Received: { bg: '#DBEAFE', text: '#2563EB' },
  UnderReview: { bg: '#FEF3C7', text: '#D97706' },
  Shortlisted: { bg: '#DCFCE7', text: '#16A34A' },
  Rejected: { bg: '#FEE2E2', text: '#DC2626' },
  InterviewScheduled: { bg: '#EDE9FE', text: '#7C3AED' },
  Hired: { bg: '#DCFCE7', text: '#16A34A' },
  PendingFeedback: { bg: '#FEF3C7', text: '#D97706' },
  NoShow: { bg: '#FEE2E2', text: '#DC2626' },
  Pending: { bg: '#FEF3C7', text: '#D97706' },
  Posted: { bg: '#DCFCE7', text: '#16A34A' },
  Expired: { bg: '#F1F5F9', text: '#64748B' },
  Failed: { bg: '#FEE2E2', text: '#DC2626' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const colorScheme = statusColors[status] || { bg: '#F1F5F9', text: '#64748B' };
  const label = status.replace(/([A-Z])/g, ' $1').trim();

  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }, size === 'medium' && styles.badgeMedium]}>
      <Text style={[styles.badgeText, { color: colorScheme.text }, size === 'medium' && styles.badgeTextMedium]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeMedium: {
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextMedium: {
    fontSize: 13,
  },
});
