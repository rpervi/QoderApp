import { Stack } from 'expo-router';

export default function CandidatesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Candidates', headerShown: true, headerTitleStyle: { fontWeight: '700' } }} />
      <Stack.Screen name="[id]" options={{ title: 'Candidate Details', headerShown: true }} />
    </Stack>
  );
}
