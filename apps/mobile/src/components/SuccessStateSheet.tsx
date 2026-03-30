import type { PaymentReceipt } from '@corridor/domain';
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { formatMoney } from '../lib/format';
import { getVenueTonePalette } from '../lib/venueTone';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { BottomActionBar } from '../ui/BottomActionBar';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

type Props = {
  onDone: () => void;
  onPayAgain: () => void;
  onSplitBill?: () => void;
  receipt: PaymentReceipt;
};

export function SuccessStateSheet({ onDone, onPayAgain, onSplitBill, receipt }: Props) {
  const theme = useTheme();
  const venueTone = getVenueTonePalette(receipt.merchant.imageTone, theme);
  const splitReady = Boolean(onSplitBill) && receipt.merchant.category === 'Dinner';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.sheet, venueTone.soft]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.hero}>
        <View style={[styles.checkWrap, { backgroundColor: venueTone.soft }]}>
          <Check color={venueTone.accent} size={28} strokeWidth={2.2} />
        </View>
        <Text style={styles.title} variant="display">
          Paid quietly.
        </Text>
        <Text color="brass" variant="caption">
          {receipt.merchant.district}
        </Text>
        <Text color="muted" style={styles.note}>
          {receipt.note}
        </Text>
        <View style={styles.receipt}>
          <View>
            <Text color="muted" variant="caption">
              Venue
            </Text>
            <Text variant="label">{receipt.merchant.name}</Text>
          </View>
          <View>
            <Text color="muted" variant="caption">
              Total
            </Text>
            <Text variant="label">{formatMoney(receipt.total)}</Text>
          </View>
        </View>
        {receipt.perkApplied ? (
          <View style={[styles.perkRow, { backgroundColor: theme.colors.sheet }]}>
            <View style={styles.perkCopy}>
              <Text color="muted" variant="caption">
                Member perk
              </Text>
              <Text variant="label">{receipt.perkApplied.title}</Text>
            </View>
            <View style={styles.perkValue}>
              <Badge label={receipt.perkApplied.label} tone="brass" />
              <Text variant="label">{`-${formatMoney(receipt.perkApplied.savings)}`}</Text>
            </View>
          </View>
        ) : null}

        {splitReady ? (
          <View style={[styles.followUpRow, { backgroundColor: theme.colors.sheet }]}>
            <View style={styles.followUpCopy}>
              <Text color="muted" variant="caption">
                Next while the table is fresh
              </Text>
              <Text variant="label">Split this dinner with your group</Text>
              <Text color="muted" style={styles.followUpNote} variant="caption">
                Keep the receipt tied to this table instead of chasing people later.
              </Text>
            </View>
            <Badge label="3 guests ready" tone="neutral" />
          </View>
        ) : null}
      </LinearGradient>

      <BottomActionBar>
        <View style={styles.actions}>
          {splitReady ? (
            <>
              <Button label="Split this table" onPress={onSplitBill} />
              <Button label="Done" onPress={onDone} variant="secondary" />
            </>
          ) : (
            <>
              <Button label="Done" onPress={onDone} />
              <Button label="Pay again" onPress={onPayAgain} variant="secondary" />
            </>
          )}
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
  hero: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 18,
    paddingBottom: 30,
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  checkWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  title: {
    marginTop: 4,
  },
  note: {
    maxWidth: 320,
  },
  receipt: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
  },
  perkRow: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  perkCopy: {
    gap: 4,
  },
  perkValue: {
    alignItems: 'flex-end',
    gap: 8,
  },
  followUpRow: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  followUpCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  followUpNote: {
    maxWidth: 240,
  },
  actions: {
    gap: 10,
  },
});
