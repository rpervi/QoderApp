import { Stack } from 'expo-router';

export default function NaukriLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Naukri Integration', headerShown: true, headerTitleStyle: { fontWeight: '700' } }} />
    </Stack>
  );
}
