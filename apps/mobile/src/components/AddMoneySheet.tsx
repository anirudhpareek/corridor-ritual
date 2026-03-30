import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CreditCard } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useScenarioStore } from '../lib/store/useScenarioStore';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  onQueued: (amountLabel: string) => void;
};

const fundingOptions = [
  {
    amount: 'AED 180',
    label: 'Arrival dinner',
    description: 'A light buffer for the first table and short city hops.',
  },
  {
    amount: 'AED 420',
    label: 'Work-trip rhythm',
    description: 'Covers a typical corridor stay with partner spend and a split or two.',
  },
  {
    amount: 'AED 720',
    label: 'Longer stay',
    description: 'A calmer cushion when the trip extends and venues stack up.',
  },
] as const;

const parseAmount = (amountLabel: string) => Number(amountLabel.replace(/[^\d.]/g, ''));

export const AddMoneySheet = forwardRef<BottomSheetModal, Props>(function AddMoneySheet({ onQueued }, ref) {
  const theme = useTheme();
  const queueTopUp = useScenarioStore((state) => state.queueTopUp);
  const [selectedAmount, setSelectedAmount] = useState<(typeof fundingOptions)[number]['amount']>('AED 420');

  return (
    <Sheet
      ref={ref}
      snapPoints={['64%']}
      subtitle="Funding remains intentionally simple in this slice. A demo top-up will move your balance into a pending settlement state."
      title="Add money">
      <View style={styles.row}>
        <CreditCard color={theme.colors.brass} size={18} strokeWidth={1.8} />
        <Text color="muted" style={{ flex: 1 }}>
          In the live product this routes through a region-aware on-ramp. Here we keep the user-facing state faithful and the rails invisible.
        </Text>
      </View>

      <View style={styles.amountList}>
        {fundingOptions.map((option) => {
          const selected = option.amount === selectedAmount;

          return (
            <Pressable
              accessibilityLabel={`${option.label}, ${option.amount}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.amount}
              onPress={() => setSelectedAmount(option.amount)}
              style={[
                styles.amountCard,
                {
                  backgroundColor: selected ? theme.colors.elevated : theme.colors.sheet,
                  borderColor: selected ? theme.colors.brass : theme.colors.softLine,
                },
                selected ? theme.shadow.soft : null,
              ]}>
              <View style={styles.amountHeader}>
                <Text variant="label">{option.label}</Text>
                <Text color={selected ? 'brass' : 'primary'} variant="label">
                  {option.amount}
                </Text>
              </View>
              <Text color="muted">{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text color="muted" style={styles.note} variant="caption">
        Funds arrive as pending first, then settle into available balance once the top-up clears.
      </Text>

      <Button
        label={`Queue ${selectedAmount}`}
        onPress={() => {
          queueTopUp(parseAmount(selectedAmount));
          onQueued(selectedAmount);
          if (ref && 'current' in ref) {
            ref.current?.dismiss();
          }
        }}
      />
    </Sheet>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  amountList: {
    gap: 10,
  },
  amountCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  amountHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  note: {
    marginTop: -2,
  },
});
