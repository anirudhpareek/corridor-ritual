import type { PaymentReceipt } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { UsersRound } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  onSendSplit: () => void;
  receipt: PaymentReceipt;
};

const suggestedGuests = ['Rohan', 'Maya', 'Sara'] as const;

export const SplitFollowUpSheet = forwardRef<BottomSheetModal, Props>(function SplitFollowUpSheet(
  { onSendSplit, receipt },
  ref,
) {
  const theme = useTheme();
  const equalShare = {
    ...receipt.total,
    amount: Math.round((receipt.total.amount / (suggestedGuests.length + 1)) * 100) / 100,
  };

  return (
    <Sheet
      ref={ref}
      snapPoints={['54%']}
      subtitle="Keep the dinner social while the receipt is still fresh. Requests stay tied to this exact table."
      title="Split this table">
      <View style={styles.content}>
        <View style={styles.heroRow}>
          <UsersRound color={theme.colors.brass} size={18} strokeWidth={1.8} />
          <View style={styles.heroCopy}>
            <Text variant="label">{receipt.merchant.name}</Text>
            <Text color="muted">
              You covered the table. Send three quiet requests now and let replies settle back into activity later.
            </Text>
          </View>
        </View>

        <View style={[styles.amountCard, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            Suggested equal share
          </Text>
          <Text variant="title">{formatMoney(equalShare)}</Text>
          <Text color="muted" variant="caption">
            Per person, with the member perk already reflected in the final total.
          </Text>
        </View>

        <View style={styles.peopleRow}>
          {suggestedGuests.map((guest) => (
            <Badge key={guest} label={guest} tone="neutral" />
          ))}
        </View>

        <Text color="muted" variant="caption">
          Split requests are lightweight in this slice. They come back as clean activity states, not invoices.
        </Text>

        <Button
          label={`Send ${suggestedGuests.length} requests`}
          onPress={() => {
            onSendSplit();
            if (ref && 'current' in ref) {
              ref.current?.dismiss();
            }
          }}
        />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  amountCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
