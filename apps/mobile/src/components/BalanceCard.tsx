import type { BalanceSummary } from '@corridor/domain';
import { StyleSheet, View } from 'react-native';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { AnimatedMoney } from './AnimatedMoney';

type Props = {
  balance: BalanceSummary;
  ctaDisabled?: boolean;
  ctaLabel?: string;
  onAddMoney: () => void;
};

export function BalanceCard({ balance, ctaDisabled, ctaLabel = 'Add money', onAddMoney }: Props) {
  return (
    <Card variant="hero">
      <Text color="muted" variant="caption">
        Travel balance
      </Text>
      <AnimatedMoney style={styles.balance} value={balance.available} variant="display" />
      <Text color="muted">One calm balance for partner spend across the corridor.</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text color="muted" variant="caption">
            Pending
          </Text>
          <AnimatedMoney value={balance.pending} variant="section" />
        </View>
        {balance.rewardsCredit ? (
          <View style={styles.metaBlock}>
            <Text color="muted" variant="caption">
              Credits
            </Text>
            <AnimatedMoney value={balance.rewardsCredit} variant="section" />
          </View>
        ) : null}
        <Badge label="Trusted states only" tone="forest" />
      </View>

      <Button disabled={ctaDisabled} label={ctaLabel} onPress={onAddMoney} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  balance: {
    marginBottom: 8,
    marginTop: 12,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 20,
  },
  metaBlock: {
    gap: 4,
  },
  button: {
    marginTop: 22,
  },
});
