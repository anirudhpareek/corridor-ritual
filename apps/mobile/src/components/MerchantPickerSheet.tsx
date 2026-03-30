import type { Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Store } from 'lucide-react-native';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  merchants: Venue[];
  onSelect: (merchant: Venue) => void;
};

export const MerchantPickerSheet = forwardRef<BottomSheetModal, Props>(function MerchantPickerSheet(
  { merchants, onSelect },
  ref,
) {
  const theme = useTheme();

  return (
    <Sheet
      ref={ref}
      snapPoints={['64%']}
      subtitle="Choose the venue you are paying at. Scanning is only a faster shortcut when the table already has a corridor code."
      title="Choose partner venue">
      <View style={[styles.summaryRow, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
        <Text variant="label">{merchants.length} curated partners nearby</Text>
        <Text color="muted" variant="caption">
          Selected for fast checkout
        </Text>
      </View>
      <View style={styles.list}>
        {merchants.map((merchant) => (
          <Pressable
            accessibilityHint="Select this partner venue for payment"
            accessibilityLabel={`${merchant.name}, ${merchant.category}, ${merchant.district}`}
            accessibilityRole="button"
            key={merchant.id}
            onPress={() => {
              onSelect(merchant);
              if (ref && 'current' in ref) {
                ref.current?.dismiss();
              }
            }}
            style={[styles.row, { borderBottomColor: theme.colors.softLine }]}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.elevated }]}>
              <Store color={theme.colors.primaryText} size={16} strokeWidth={1.8} />
            </View>
            <View style={styles.copy}>
              <Text variant="label">{merchant.name}</Text>
              <Text color="muted">{merchant.district}</Text>
              <Text color="muted" style={styles.vibe} variant="caption">
                {merchant.vibe}
              </Text>
            </View>
            <View style={styles.meta}>
              <Badge label={merchant.category} tone="neutral" />
              <Text color="muted" variant="caption">
                {merchant.priceNote}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  list: {
    gap: 4,
  },
  summaryRow: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  copy: {
    flex: 1,
  },
  vibe: {
    marginTop: 3,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: 90,
  },
});
