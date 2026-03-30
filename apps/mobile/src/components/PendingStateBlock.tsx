import type { Money } from '@corridor/domain';
import { Clock3 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  amount: Money;
  kind?: 'funding' | 'payment';
};

export function PendingStateBlock({ amount, kind = 'funding' }: Props) {
  const theme = useTheme();
  const title = kind === 'payment' ? 'Payment in motion' : 'Pending arrival';
  const detail =
    kind === 'payment'
      ? `${formatMoney(amount)} is reserved for this venue while settlement finishes. We will mark it settled as soon as the final confirmation lands.`
      : `${formatMoney(amount)} is on the way. We hold it separately until settlement completes.`;
  const badgeLabel = kind === 'payment' ? 'Settlement in progress' : 'No action needed';

  return (
    <Card style={styles.card} variant="default">
      <View style={styles.row}>
        <Clock3 color={theme.colors.pending} size={18} strokeWidth={1.8} />
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text variant="label">{title}</Text>
            <Badge label={badgeLabel} tone="pending" />
          </View>
          <Text color="muted" style={styles.detail}>
            {detail}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderStyle: 'dashed',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detail: {
    marginTop: 4,
  },
});
