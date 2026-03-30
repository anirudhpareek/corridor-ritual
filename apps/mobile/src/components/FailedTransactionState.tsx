import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { BottomActionBar } from '../ui/BottomActionBar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  merchantName: string;
  onBack: () => void;
  onRetry: () => void;
};

export function FailedTransactionState({ merchantName, onBack, onRetry }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CircleAlert color={theme.colors.danger} size={28} strokeWidth={2.1} />
        <Text style={styles.title} variant="title">
          Final confirmation did not land.
        </Text>
        <Text color="muted">
          {merchantName} never received a settled confirmation. You can retry now or step back without worrying about a hidden duplicate charge.
        </Text>
      </Card>

      <BottomActionBar>
        <View style={styles.actions}>
          <Button label="Retry payment" onPress={onRetry} />
          <Button label="Back to pay" onPress={onBack} variant="secondary" />
        </View>
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    gap: 14,
    paddingVertical: 26,
  },
  title: {
    marginTop: 4,
  },
  actions: {
    gap: 10,
  },
});
