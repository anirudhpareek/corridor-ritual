import { Link, Stack } from 'expo-router';
import { Compass } from 'lucide-react-native';

import { EmptyState } from '../src/ui/EmptyState';
import { Screen } from '../src/ui/Screen';
import { Button } from '../src/ui/Button';
import { useTheme } from '../src/theme';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen ornament="home">
        <EmptyState
          description="That route isn’t part of the first slice. Head back to the corridor surfaces that are live in this prototype."
          icon={<Compass color={theme.colors.brass} size={24} strokeWidth={1.8} />}
          title="This surface doesn’t exist yet"
        />
        <Link asChild href="/">
          <Button label="Return home" />
        </Link>
      </Screen>
    </>
  );
}
