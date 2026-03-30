import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '../../src/services/authService';
import { spacing } from '../../src/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateForm = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setError('');
  };

  const handleRegister = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Full name, email and password are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.register({ ...form, role: 'HR' });
      setSuccess('User created successfully!');
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={{ fontWeight: '700', color: theme.colors.onBackground, marginBottom: spacing.xxl }}>
          Create HR Account
        </Text>

        <TextInput label="Full Name" value={form.fullName} onChangeText={(v) => updateForm('fullName', v)} mode="outlined" left={<TextInput.Icon icon="account" />} style={styles.input} />
        <TextInput label="Email" value={form.email} onChangeText={(v) => updateForm('email', v)} mode="outlined" keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email" />} style={styles.input} />
        <TextInput label="Password" value={form.password} onChangeText={(v) => updateForm('password', v)} mode="outlined" secureTextEntry left={<TextInput.Icon icon="lock" />} style={styles.input} />
        <TextInput label="Phone" value={form.phone} onChangeText={(v) => updateForm('phone', v)} mode="outlined" keyboardType="phone-pad" left={<TextInput.Icon icon="phone" />} style={styles.input} />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}
        {success ? <HelperText type="info" visible style={{ color: '#16A34A' }}>{success}</HelperText> : null}

        <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.button} contentStyle={{ paddingVertical: 6 }}>
          Create Account
        </Button>
        <Button mode="text" onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          Cancel
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xxl, paddingTop: spacing.xxxl },
  input: { marginBottom: spacing.lg },
  button: { marginTop: spacing.lg, borderRadius: 12 },
});
