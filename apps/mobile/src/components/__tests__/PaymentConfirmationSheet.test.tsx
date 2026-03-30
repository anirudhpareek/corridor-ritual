import { fireEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { PaymentConfirmationSheet } from '../PaymentConfirmationSheet';
import { renderWithProviders } from '../../test-utils';
import { money, venue } from '../../test-fixtures/componentFixtures';

function RenderSheet() {
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '148',
    },
  });

  return (
    <View>
      <PaymentConfirmationSheet
        actionMode="confirm"
        amountPresets={[
          { id: 'usual-table', label: 'Usual table', value: 148 },
          { id: 'one-more-round', label: 'One more round', value: 175 },
        ]}
        amountValue={form.watch('amount')}
        control={form.control}
        errors={{}}
        loading={false}
        onSelectAmountPreset={(amount) => {
          form.setValue('amount', String(amount));
        }}
        onSubmit={jest.fn()}
        quote={{
          amount: money(148),
          balanceAfter: money(556),
          merchant: venue,
          perkApplied: {
            category: 'dining',
            city: 'Dubai',
            description: 'Members get a quiet-table credit at partner dinners after 8pm.',
            id: 'perk_1',
            label: '20 AED back',
            savings: money(20),
            title: 'Arrival supper',
          },
          subtotal: money(148),
          total: money(128),
        }}
        quoteLoading={false}
        quoteStale={false}
      />
    </View>
  );
}

function RenderRefreshingSheet() {
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '148',
    },
  });

  return (
    <View>
      <PaymentConfirmationSheet
        actionMode="confirm"
        amountPresets={[{ id: 'usual-table', label: 'Usual table', value: 148 }]}
        amountValue={form.watch('amount')}
        control={form.control}
        errors={{}}
        loading={false}
        onSelectAmountPreset={(amount) => {
          form.setValue('amount', String(amount));
        }}
        onSubmit={jest.fn()}
        quote={{
          amount: money(148),
          balanceAfter: money(556),
          merchant: venue,
          perkApplied: null,
          subtotal: money(148),
          total: money(148),
        }}
        quoteLoading={false}
        quoteStale
      />
    </View>
  );
}

function RenderVerifySheet() {
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '148',
    },
  });

  return (
    <View>
      <PaymentConfirmationSheet
        actionMode="verify"
        amountPresets={[{ id: 'usual-table', label: 'Usual table', value: 148 }]}
        amountValue={form.watch('amount')}
        control={form.control}
        errors={{}}
        loading={false}
        onSelectAmountPreset={(amount) => {
          form.setValue('amount', String(amount));
        }}
        onSubmit={jest.fn()}
        quote={{
          amount: money(148),
          balanceAfter: money(0),
          merchant: venue,
          perkApplied: null,
          subtotal: money(148),
          total: money(148),
        }}
        quoteLoading={false}
        quoteStale={false}
      />
    </View>
  );
}

function RenderReviewSheet() {
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '148',
    },
  });

  return (
    <View>
      <PaymentConfirmationSheet
        actionMode="review"
        amountPresets={[{ id: 'usual-table', label: 'Usual table', value: 148 }]}
        amountValue={form.watch('amount')}
        control={form.control}
        errors={{}}
        loading={false}
        onSelectAmountPreset={(amount) => {
          form.setValue('amount', String(amount));
        }}
        onSubmit={jest.fn()}
        quote={{
          amount: money(148),
          balanceAfter: money(0),
          merchant: venue,
          perkApplied: null,
          subtotal: money(148),
          total: money(148),
        }}
        quoteLoading={false}
        quoteStale={false}
      />
    </View>
  );
}

describe('PaymentConfirmationSheet', () => {
  it('renders merchant totals and confirm action', () => {
    const { getByText } = renderWithProviders(<RenderSheet />);

    expect(getByText('Review payment')).toBeTruthy();
    expect(getByText("Jun's Table")).toBeTruthy();
    expect(getByText('Usual table')).toBeTruthy();
    expect(getByText('AED 128')).toBeTruthy();
    expect(getByText('Quote ready')).toBeTruthy();
    expect(getByText('Confirm payment')).toBeTruthy();
  });

  it('updates the amount when a preset is selected', () => {
    const { getByDisplayValue, getByText } = renderWithProviders(<RenderSheet />);

    fireEvent.press(getByText('One more round'));

    expect(getByDisplayValue('175')).toBeTruthy();
  });

  it('shows a refreshing state while the latest quote is stale', () => {
    const { getByLabelText, getByText } = renderWithProviders(<RenderRefreshingSheet />);

    expect(getByText('Refreshing total')).toBeTruthy();
    expect(getByText('We are quietly updating the final total for this amount.')).toBeTruthy();
    expect(getByLabelText('Confirm payment').props.accessibilityState.disabled).toBe(true);
  });

  it('switches the primary action to verification when spend is still locked', () => {
    const { getByLabelText, getByText } = renderWithProviders(<RenderVerifySheet />);

    expect(getByText('Verify to pay')).toBeTruthy();
    expect(getByText('Previewing before spend unlocks')).toBeTruthy();
    expect(getByLabelText('Verify to pay').props.accessibilityState.disabled).toBe(false);
  });

  it('shows a disabled review state while verification is still pending', () => {
    const { getByLabelText, getByText } = renderWithProviders(<RenderReviewSheet />);

    expect(getByText('Verification still in review')).toBeTruthy();
    expect(getByLabelText('Verification in review').props.accessibilityState.disabled).toBe(true);
  });
});
