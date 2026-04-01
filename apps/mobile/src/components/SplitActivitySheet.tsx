import type { SplitRequest } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CheckCircle2, UsersRound } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { getSplitAmounts, getSplitCounts, getSplitLabel, getSplitTone } from '../lib/splits';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  split: SplitRequest | null;
  onOpenSplit: () => void;
};

function splitNarrative(split: SplitRequest) {
  const { paidCount, pendingCount, totalCount } = getSplitCounts(split);
  const { remainingAmount, settledBackAmount } = getSplitAmounts(split);

  if (split.status === 'settled') {
    return `All ${totalCount} guests have replied. ${formatMoney({
      ...split.requestedBack,
      amount: settledBackAmount,
    })} has already settled back to the original table thread.`;
  }

  if (split.status === 'partially_settled') {
    return `${paidCount} of ${totalCount} guests have replied. ${formatMoney({
      ...split.requestedBack,
      amount: remainingAmount,
    })} is still pending across ${pendingCount} guest${pendingCount === 1 ? '' : 's'}.`;
  }

  return `${formatMoney(split.requestedBack)} is still waiting across ${pendingCount} guest${
    pendingCount === 1 ? '' : 's'
  }. The original dinner remains settled while the social follow-up catches up.`;
}

export const SplitActivitySheet = forwardRef<BottomSheetModal, Props>(function SplitActivitySheet(
  { onOpenSplit, split },
  ref,
) {
  const theme = useTheme();

  if (!split) {
    return null;
  }

  const { paidCount, pendingCount } = getSplitCounts(split);
  const { remainingAmount, settledBackAmount } = getSplitAmounts(split);

  return (
    <Sheet
      ref={ref}
      snapPoints={['64%']}
      subtitle="Split history should feel like a live social thread, not a detached reimbursement log."
      title="Split summary">
      <View style={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
          <View style={styles.heroHeader}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.brassSoft }]}>
              <UsersRound color={theme.colors.brass} size={18} strokeWidth={1.8} />
            </View>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {split.venueName}
              </Text>
              <Text style={styles.heroTitle} variant="title">
                {split.title}
              </Text>
            </View>
            <Badge label={getSplitLabel(split.status)} tone={getSplitTone(split.status)} />
          </View>
          <Text color="muted" style={styles.heroDetail}>
            {splitNarrative(split)}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
            <Text variant="label">
              {paidCount} paid · {pendingCount} pending
            </Text>
            <Text color="muted" variant="caption">
              Reply state
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
            <Text variant="label">
              {formatMoney({
                ...split.requestedBack,
                amount: split.status === 'pending' ? remainingAmount : settledBackAmount,
              })}
            </Text>
            <Text color="muted" variant="caption">
              {split.status === 'pending' ? 'Still pending' : 'Returned back'}
            </Text>
          </View>
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <View style={styles.noteHeader}>
            <CheckCircle2 color={theme.colors.forest} size={16} strokeWidth={1.8} />
            <Text variant="label">What stays anchored</Text>
          </View>
          <Text color="muted">{split.note}</Text>
        </View>

        <Button label="Open split" onPress={onOpenSplit} />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  hero: {
    borderRadius: 24,
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    marginTop: 8,
  },
  heroDetail: {
    maxWidth: 310,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteBlock: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
