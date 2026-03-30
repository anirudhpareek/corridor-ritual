import type { PaymentQuote } from '@corridor/domain';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { BottomActionBar } from '../ui/BottomActionBar';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

export type PaymentFormValues = {
  amount: string;
};

export type AmountPreset = {
  id: string;
  label: string;
  value: number;
};

type Props = {
  actionMode: 'join' | 'verify' | 'review' | 'confirm';
  amountPresets: AmountPreset[];
  amountValue: string;
  control: Control<PaymentFormValues>;
  errors: FieldErrors<PaymentFormValues>;
  loading: boolean;
  onSelectAmountPreset: (amount: number) => void;
  onSubmit: () => void;
  quote: PaymentQuote | null;
  quoteLoading: boolean;
  quoteStale: boolean;
};

export function PaymentConfirmationSheet({
  actionMode,
  amountPresets,
  amountValue,
  control,
  errors,
  loading,
  onSelectAmountPreset,
  onSubmit,
  quote,
  quoteLoading,
  quoteStale,
}: Props) {
  const theme = useTheme();
  const confirmDisabled = actionMode === 'review' || loading || quoteLoading || quoteStale || Boolean(errors.amount) || !quote;
  const activePresetValue = Number(amountValue);
  const actionLabel =
    actionMode === 'join'
      ? 'Join to pay'
      : actionMode === 'verify'
        ? 'Verify to pay'
        : actionMode === 'review'
          ? 'Verification in review'
          : loading
            ? 'Confirming…'
            : 'Confirm payment';
  const actionHint =
    actionMode === 'join'
      ? 'Continue into member preview before paying'
      : actionMode === 'verify'
        ? 'Verify this member account before paying the partner venue'
        : actionMode === 'review'
          ? 'Spend is paused while verification is still being reviewed'
          : 'Confirm this partner payment';

  return (
    <View style={styles.shell}>
      <Card style={styles.sheet} variant="hero">
        <Text color="muted" variant="caption">
          Review payment
        </Text>
        <Text style={styles.title} variant="title">
          {quote?.merchant.name ?? 'Partner venue'}
        </Text>
        <Text color="muted">{quote?.merchant.district ?? 'Demo location'}</Text>

        <View style={styles.inputWrap}>
          <Text color="muted" variant="caption">
            Amount
          </Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                accessibilityLabel="Payment amount"
                accessibilityHint="Enter the amount to pay this partner venue"
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="0"
                placeholderTextColor={theme.colors.mutedText}
                returnKeyType="done"
                style={[styles.input, { borderColor: errors.amount ? theme.colors.danger : theme.colors.softLine, color: theme.colors.primaryText }]}
                value={value}
              />
            )}
          />
          {errors.amount?.message ? (
            <Text color="danger" style={styles.error} variant="caption">
              {errors.amount.message}
            </Text>
          ) : null}
        </View>

        {amountPresets.length ? (
          <View style={styles.presetWrap}>
            {amountPresets.map((preset) => {
              const selected = activePresetValue === preset.value;

              return (
                <Pressable
                  accessibilityLabel={`${preset.label}, ${formatMoney({ amount: preset.value, currency: quote?.amount.currency ?? 'AED' })}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={preset.id}
                  onPress={() => onSelectAmountPreset(preset.value)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: selected ? theme.colors.elevated : theme.colors.sheet,
                      borderColor: selected ? theme.colors.brass : theme.colors.softLine,
                    },
                  ]}>
                  <Text variant="label">{preset.label}</Text>
                  <Text color={selected ? 'brass' : 'muted'} variant="caption">
                    {formatMoney({ amount: preset.value, currency: quote?.amount.currency ?? 'AED' })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.quoteStateRow}>
          <Badge
            label={quoteLoading || quoteStale ? 'Refreshing total' : 'Quote ready'}
            tone={quoteLoading || quoteStale ? 'pending' : 'forest'}
          />
          <Text color="muted" style={styles.quoteStateCopy} variant="caption">
            {quoteLoading || quoteStale
              ? 'We are quietly updating the final total for this amount.'
              : 'Perks and final total are locked to the current amount shown here.'}
          </Text>
        </View>

        {quote?.perkApplied ? (
          <View style={styles.perkRow}>
            <View style={styles.perkCopy}>
              <Text variant="label">{quote.perkApplied.title}</Text>
              <Text color="muted" style={styles.perkDescription}>
                {quote.perkApplied.description}
              </Text>
            </View>
            <Badge label={`-${formatMoney(quote.perkApplied.savings)}`} tone="success" />
          </View>
        ) : null}

        {actionMode === 'join' || actionMode === 'verify' ? (
          <View style={[styles.previewRow, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <Text variant="label">{actionMode === 'join' ? 'Previewing before you join' : 'Previewing before spend unlocks'}</Text>
            <Text color="muted" style={styles.previewCopy}>
              We keep the venue total visible first. Balance checks and final confirmation turn on after you move past this step.
            </Text>
          </View>
        ) : null}

        {actionMode === 'review' ? (
          <View style={[styles.reviewRow, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <Text variant="label">Verification still in review</Text>
            <Text color="muted" style={styles.reviewCopy}>
              Keep the venue selected. Spend unlocks as soon as checks clear.
            </Text>
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text color="muted">Subtotal</Text>
            <Text>{quote ? formatMoney(quote.subtotal) : 'AED 0'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text color="muted">Total</Text>
            <Text variant="section">{quote ? formatMoney(quote.total) : 'AED 0'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text color="muted">Balance after</Text>
            <Text>{quote ? formatMoney(quote.balanceAfter) : 'AED 0'}</Text>
          </View>
        </View>
      </Card>

      <BottomActionBar>
        <Button
          accessibilityHint={actionHint}
          disabled={confirmDisabled}
          label={actionLabel}
          loading={loading}
          onPress={onSubmit}
        />
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: 18,
    paddingBottom: 24,
    paddingTop: 22,
  },
  title: {
    marginTop: 4,
  },
  inputWrap: {
    gap: 8,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 30,
    lineHeight: 34,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    marginTop: -2,
  },
  quoteStateRow: {
    alignItems: 'flex-start',
    gap: 8,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -2,
  },
  presetChip: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    minWidth: 104,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quoteStateCopy: {
    maxWidth: 280,
  },
  perkRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  perkCopy: {
    flex: 1,
    paddingRight: 12,
  },
  perkDescription: {
    marginTop: 4,
  },
  previewRow: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  previewCopy: {
    maxWidth: 280,
  },
  reviewRow: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  reviewCopy: {
    maxWidth: 280,
  },
  summary: {
    gap: 12,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
