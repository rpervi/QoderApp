import { Stack } from 'expo-router';

export default function JobsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Jobs', headerShown: true, headerTitleStyle: { fontWeight: '700' } }} />
      <Stack.Screen name="[id]" options={{ title: 'Job Details', headerShown: true }} />
      <Stack.Screen name="create" options={{ title: 'Create Job', presentation: 'modal', headerShown: true }} />
    </Stack>
  );
}
