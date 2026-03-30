import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '../../theme';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
}

export function StatCard({ title, value, subtitle, icon, color, bgColor }: StatCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text variant="headlineMedium" style={[styles.value, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      <Text variant="bodySmall" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="labelSmall" style={[styles.subtitle, { color }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 16,
    marginHorizontal: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
