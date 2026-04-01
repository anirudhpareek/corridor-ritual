import type { ActivityItem } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ArrowDownLeft, ArrowUpRight, CircleAlert, Clock3, ReceiptText } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMoneySigned, formatTimestamp, statusLabel, titleCase } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  item: ActivityItem | null;
  onSupportPress: () => void;
  supportActionLabel?: string;
};

function activityNarrative(item: ActivityItem) {
  if (item.kind === 'topup') {
    if (item.status === 'pending') {
      return 'Funds are moving into your travel balance. They stay separate until settlement clears.';
    }

    if (item.status === 'failed') {
      return 'The top-up did not finish. The corridor did not move those funds into available balance.';
    }

    return 'Funds arrived and settled into your travel balance.';
  }

  if (item.kind === 'split') {
    if (item.status === 'pending') {
      return 'Split requests are already out with your circle. The original payment stayed complete.';
    }

    if (item.status === 'failed') {
      return 'The split recovery did not finish. The original payment state is unchanged.';
    }

    return 'The shared spend settled back into your balance cleanly.';
  }

  if (item.kind === 'refund') {
    if (item.status === 'pending') {
      return 'The reversal is on the way back into your balance. You do not need to retry the request.';
    }

    if (item.status === 'failed') {
      return 'The refund did not clear. Support can trace it from the original receipt trail.';
    }

    return 'The reversal settled back into your balance and is attached to the original receipt trail.';
  }

  if (item.status === 'pending') {
    return 'The venue already saw the payment intent. Final settlement is still processing quietly in the background.';
  }

  if (item.status === 'failed') {
    return 'The venue never received a final confirmation. No duplicate charge was created.';
  }

  return 'Partner spend settled quietly. The corridor kept the receipt close without exposing the underlying rails.';
}

function nextStepCopy(item: ActivityItem) {
  if (item.status === 'failed') {
    return 'If this looks wrong on the venue side, support can reconcile it from the original intent.';
  }

  if (item.status === 'pending') {
    return 'Let the state settle unless it stops moving. Support is still attached to this receipt if you need it.';
  }

  return 'Receipts and any later support stay attached to this movement instead of living in a separate ledger view.';
}

export const ActivityDetailSheet = forwardRef<BottomSheetModal, Props>(function ActivityDetailSheet(
  { item, onSupportPress, supportActionLabel = 'Open support' },
  ref,
) {
  const theme = useTheme();

  if (!item) {
    return null;
  }

  const Icon =
    item.status === 'failed'
      ? CircleAlert
      : item.status === 'pending'
        ? Clock3
        : item.direction === 'credit'
          ? ArrowDownLeft
          : ArrowUpRight;

  const iconColors =
    item.status === 'failed'
      ? { backgroundColor: theme.colors.dangerSoft, foreground: theme.colors.danger }
      : item.status === 'pending'
        ? { backgroundColor: theme.colors.pendingSoft, foreground: theme.colors.pending }
        : item.direction === 'credit'
          ? { backgroundColor: theme.colors.successSoft, foreground: theme.colors.success }
          : { backgroundColor: theme.colors.elevated, foreground: theme.colors.primaryText };

  return (
    <Sheet
      ref={ref}
      snapPoints={['68%']}
      subtitle="Recent movement should explain itself with one calm receipt, not a dashboard table."
      title="Receipt detail">
      <View style={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.iconWrap, { backgroundColor: iconColors.backgroundColor }]}>
              <Icon color={iconColors.foreground} size={18} strokeWidth={1.8} />
            </View>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {titleCase(item.kind)} movement
              </Text>
              <Text style={styles.heroTitle} variant="display">
                {item.title}
              </Text>
            </View>
            <Badge
              label={statusLabel(item.status)}
              tone={item.status === 'failed' ? 'danger' : item.status === 'pending' ? 'pending' : 'neutral'}
            />
          </View>

          <Text color="muted" style={styles.heroSubtitle}>
            {item.subtitle}
          </Text>

          <View style={styles.heroMeta}>
            <Text variant="label">{formatMoneySigned(item.amount, item.direction)}</Text>
            <Text color="muted" variant="caption">
              {formatTimestamp(item.occurredAt)}
            </Text>
          </View>
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
          <View style={styles.noteHeader}>
            <ReceiptText color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <Text variant="label">What happened</Text>
          </View>
          <Text color="muted">{activityNarrative(item)}</Text>
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            What happens next
          </Text>
          <Text>{nextStepCopy(item)}</Text>
        </View>

        <Button label={supportActionLabel} onPress={onSupportPress} variant="secondary" />
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
  heroTopRow: {
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
    maxWidth: 220,
  },
  heroSubtitle: {
    maxWidth: 300,
  },
  heroMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
