import type { ActivityItem } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Headphones, MessageSquareQuote } from 'lucide-react-native';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatTimestamp, statusLabel, titleCase } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  item: ActivityItem | null;
  onSubmit: (reason: string) => void;
};

type SupportOption = {
  id: string;
  title: string;
  detail: string;
};

function supportOptions(item: ActivityItem): SupportOption[] {
  if (item.kind === 'topup') {
    return item.status === 'pending'
      ? [
          {
            id: 'topup_stuck',
            title: 'This top-up is taking too long',
            detail: 'Use when pending funds have stayed unchanged longer than expected.',
          },
          {
            id: 'topup_amount',
            title: 'The amount looks wrong',
            detail: 'Use when the pending or credited amount does not match the original funding intent.',
          },
          {
            id: 'topup_trace',
            title: 'I need a settlement trace',
            detail: 'Use when you need support to explain what stage the top-up is currently in.',
          },
        ]
      : [
          {
            id: 'topup_missing',
            title: 'The balance still looks off',
            detail: 'Use when the final credited amount does not match what you expected.',
          },
          {
            id: 'topup_receipt',
            title: 'I need the funding receipt',
            detail: 'Use when you need support to confirm what reached the corridor balance.',
          },
          {
            id: 'topup_other',
            title: 'Something else about this top-up',
            detail: 'Use when the issue is real but does not fit the standard paths.',
          },
        ];
  }

  if (item.kind === 'split') {
    return [
      {
        id: 'split_pending',
        title: 'A guest did not receive the split',
        detail: 'Use when the request never reached the right person or should be resent.',
      },
      {
        id: 'split_amount',
        title: 'The split amount needs adjustment',
        detail: 'Use when shares were assigned incorrectly and need support review.',
      },
      {
        id: 'split_other',
        title: 'This split should not be in this state',
        detail: 'Use when the payment is complete but the split still looks wrong.',
      },
    ];
  }

  if (item.kind === 'refund') {
    return [
      {
        id: 'refund_eta',
        title: 'I need a refund timing update',
        detail: 'Use when the reversal has not settled back as quickly as expected.',
      },
      {
        id: 'refund_missing',
        title: 'The refund amount looks wrong',
        detail: 'Use when the returned amount does not match the original receipt trail.',
      },
      {
        id: 'refund_other',
        title: 'Something else about this refund',
        detail: 'Use when the reversal needs manual review for another reason.',
      },
    ];
  }

  if (item.status === 'failed') {
    return [
      {
        id: 'spend_failed_but_merchant',
        title: 'The venue thinks I was charged',
        detail: 'Use when the payment failed here but the venue says something still went through.',
      },
      {
        id: 'spend_retry',
        title: 'I need help retrying this payment',
        detail: 'Use when you want support to confirm the safest next step before trying again.',
      },
      {
        id: 'spend_other_failed',
        title: 'Something else about this failed payment',
        detail: 'Use when the failure state needs support context beyond the standard path.',
      },
    ];
  }

  if (item.status === 'pending') {
    return [
      {
        id: 'spend_pending_too_long',
        title: 'This payment is pending too long',
        detail: 'Use when the status has stayed in limbo longer than you expect.',
      },
      {
        id: 'spend_pending_merchant',
        title: 'The venue asked for confirmation',
        detail: 'Use when the merchant needs reassurance while the payment is still settling.',
      },
      {
        id: 'spend_pending_other',
        title: 'Something else about this pending payment',
        detail: 'Use when the settlement state needs manual support review.',
      },
    ];
  }

  return [
    {
      id: 'receipt_copy',
      title: 'I need help with this receipt',
      detail: 'Use when you need support to confirm what settled and how it should look here.',
    },
    {
      id: 'merchant_followup',
      title: 'I need a venue follow-up',
      detail: 'Use when a settled payment still needs partner support context.',
    },
    {
      id: 'other',
      title: 'Something else about this movement',
      detail: 'Use when the issue is real but does not match the standard categories.',
    },
  ];
}

export const SupportIssueSheet = forwardRef<BottomSheetModal, Props>(function SupportIssueSheet(
  { item, onSubmit },
  ref,
) {
  const theme = useTheme();
  const options = useMemo(() => (item ? supportOptions(item) : []), [item]);
  const [selectedId, setSelectedId] = useState<string | null>(options[0]?.id ?? null);

  useEffect(() => {
    setSelectedId(options[0]?.id ?? null);
  }, [options]);

  if (!item) {
    return null;
  }

  const selectedOption = options.find((option) => option.id === selectedId) ?? options[0] ?? null;

  return (
    <Sheet
      ref={ref}
      snapPoints={['74%']}
      subtitle="Support should stay attached to the original receipt so the context does not get lost."
      title="Support request">
      <View style={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
          <View style={styles.heroHeader}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.brassSoft }]}>
              <Headphones color={theme.colors.brass} size={18} strokeWidth={1.8} />
            </View>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {titleCase(item.kind)} · {statusLabel(item.status)}
              </Text>
              <Text style={styles.heroTitle} variant="title">
                {item.title}
              </Text>
            </View>
            <Badge label={formatTimestamp(item.occurredAt)} tone="neutral" />
          </View>
          <Text color="muted" style={styles.heroSubtitle}>
            Choose the path that best matches what feels off. Support will keep the original receipt attached.
          </Text>
        </View>

        <View style={styles.list}>
          {options.map((option) => {
            const isSelected = option.id === selectedId;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.id}
                onPress={() => setSelectedId(option.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? theme.colors.elevated : theme.colors.sheet,
                    borderColor: isSelected ? theme.colors.brass : theme.colors.softLine,
                  },
                ]}>
                <View style={styles.optionCopy}>
                  <Text variant="label">{option.title}</Text>
                  <Text color="muted" style={styles.optionDetail}>
                    {option.detail}
                  </Text>
                </View>
                <Badge label={isSelected ? 'Selected' : 'Open'} tone={isSelected ? 'brass' : 'neutral'} />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <View style={styles.noteHeader}>
            <MessageSquareQuote color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <Text variant="label">What support receives</Text>
          </View>
          <Text color="muted">
            {selectedOption
              ? `${selectedOption.title}. The receipt state, amount, and timing stay attached so support starts from the same context you see here.`
              : 'The selected issue and receipt state stay attached so support starts from the same context you see here.'}
          </Text>
        </View>

        <Button
          label="Send to support"
          onPress={() => {
            if (selectedOption) {
              onSubmit(selectedOption.title);
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
  heroSubtitle: {
    maxWidth: 305,
  },
  list: {
    gap: 10,
  },
  option: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  optionCopy: {
    flex: 1,
    gap: 5,
    paddingRight: 10,
  },
  optionDetail: {
    maxWidth: 280,
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
