import type { SplitRequest } from '@corridor/domain';
import { ArrowRight, UsersRound } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { getSplitAmounts, getSplitCounts, getSplitLabel, getSplitTone } from '../lib/splits';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  split: SplitRequest;
  onPress?: () => void;
};

export function SplitCard({ onPress, split }: Props) {
  const theme = useTheme();
  const { paidCount, pendingCount } = getSplitCounts(split);
  const { remainingAmount, settledBackAmount } = getSplitAmounts(split);
  const amountLabel = split.status === 'pending' ? 'Requested back' : split.status === 'settled' ? 'Returned back' : 'Settled back';
  const amountValue = split.status === 'pending' ? split.requestedBack : { ...split.requestedBack, amount: settledBackAmount };
  const metaNote =
    split.status === 'settled'
      ? 'Everyone replied and the full dinner settled back into the corridor.'
      : split.status === 'partially_settled'
        ? `${pendingCount} guest${pendingCount === 1 ? '' : 's'} still pending. ${formatMoney({
            ...split.requestedBack,
            amount: remainingAmount,
          })} remains outstanding.`
        : `${pendingCount} guest${pendingCount === 1 ? '' : 's'} still need to reply.`;

  return (
    <Pressable
      accessibilityHint={onPress ? 'Opens split detail' : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: onPress && pressed ? 0.9 : 1 }]}>
      <Card variant="hero">
        <View style={styles.topRow}>
          <View style={styles.copy}>
            <Text color="muted" variant="caption">
              Group activity
            </Text>
            <Text style={styles.title} variant="title">
              {split.title}
            </Text>
          </View>
          <Badge label={getSplitLabel(split.status)} tone={getSplitTone(split.status)} />
        </View>

        <Text color="muted" style={styles.subtitle}>
          {split.subtitle}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
            <UsersRound color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">
                {paidCount} paid · {pendingCount} pending
              </Text>
              <Text color="muted" variant="caption">
                Reply state
              </Text>
            </View>
          </View>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
            <View style={styles.amountCopy}>
              <Text variant="label">{formatMoney(amountValue)}</Text>
              <Text color="muted" variant="caption">
                {amountLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.noteRow, { borderColor: theme.colors.softLine }]}>
          <Text color="muted" style={styles.noteCopy}>
            {metaNote}
          </Text>
          {onPress ? <ArrowRight color={theme.colors.brass} size={16} strokeWidth={1.8} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginTop: 6,
  },
  subtitle: {
    marginTop: 12,
  },
  metaRow: {
    gap: 10,
    marginTop: 18,
  },
  metaCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  amountCopy: {
    gap: 2,
  },
  noteRow: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteCopy: {
    flex: 1,
  },
});
