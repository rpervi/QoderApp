import { Stack } from 'expo-router';

export default function InterviewsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Interviews', headerShown: true, headerTitleStyle: { fontWeight: '700' } }} />
      <Stack.Screen name="schedule" options={{ title: 'Schedule Interview', presentation: 'modal', headerShown: true }} />
    </Stack>
  );
}
