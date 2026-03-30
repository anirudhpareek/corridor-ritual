import type { Venue } from '@corridor/domain';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { ChevronLeft, Compass, MapPinned } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import type { AmountPreset } from '../../components/PaymentConfirmationSheet';
import { PaymentConfirmationSheet } from '../../components/PaymentConfirmationSheet';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { triggerHaptic } from '../../lib/haptics';
import { useConfirmPayment, usePayEntryQuery, useQuotePayment } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { getVenueTonePalette } from '../../lib/venueTone';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { EmptyState } from '../../ui/EmptyState';
import { Screen } from '../../ui/Screen';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function PayConfirmScreen() {
  const onboardingRef = useRef<BottomSheetModal>(null);
  const verificationRef = useRef<BottomSheetModal>(null);
  const { data, error, isLoading, refetch } = usePayEntryQuery();
  const quoteMutation = useQuotePayment();
  const confirmMutation = useConfirmPayment();
  const { showToast } = useToast();
  const theme = useTheme();
  const merchantId = useScenarioStore((state) => state.payDraft.merchantId);
  const amountText = useScenarioStore((state) => state.payDraft.amountText);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);
  const setReceipt = useScenarioStore((state) => state.setReceipt);
  const scenario = useScenarioStore((state) => state.scenario);

  const selectedMerchant: Venue | undefined = useMemo(
    () => data?.merchants.find((merchant) => merchant.id === merchantId),
    [data?.merchants, merchantId],
  );
  const amountPresets = useMemo<AmountPreset[]>(() => {
    if (!selectedMerchant) {
      return [];
    }

    const base = selectedMerchant.recommendedSpend.amount;
    const roundTo = (value: number, step: number) => Math.ceil(value / step) * step;
    const variants =
      selectedMerchant.category === 'Coffee'
        ? [
            { id: 'usual-stop', label: 'Usual stop', value: base },
            { id: 'second-coffee', label: 'Second coffee', value: roundTo(base * 1.6, 5) },
            { id: 'longer-session', label: 'Longer session', value: roundTo(base * 2.2, 5) },
          ]
        : selectedMerchant.category === 'Recovery'
          ? [
              { id: 'session', label: 'Session', value: base },
              { id: 'add-on', label: 'Add-on', value: roundTo(base * 1.18, 5) },
              { id: 'full-reset', label: 'Full reset', value: roundTo(base * 1.36, 10) },
            ]
          : [
              { id: 'usual-table', label: 'Usual table', value: base },
              { id: 'one-more-round', label: 'One more round', value: roundTo(base * 1.18, 5) },
              { id: 'larger-table', label: 'Larger table', value: roundTo(base * 1.36, 10) },
            ];

    return variants.filter((preset, index, array) => array.findIndex((candidate) => candidate.value === preset.value) === index);
  }, [selectedMerchant]);
  const requiresAvailableBalance = data?.user.memberState === 'verified_for_spend' && scenario !== 'verificationPending';

  const amountSchema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .min(1, 'Enter an amount')
          .refine((value) => !Number.isNaN(Number(value)), 'Use digits only')
          .refine((value) => Number(value) > 0, 'Amount must be above zero')
          .refine(
            (value) => !requiresAvailableBalance || Number(value) <= (data?.balance.available.amount ?? 99999),
            'Keep this within the available balance',
          ),
      }),
    [data?.balance.available.amount, requiresAvailableBalance],
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<{ amount: string }>({
    defaultValues: {
      amount: amountText || String(selectedMerchant?.recommendedSpend.amount ?? ''),
    },
    resolver: zodResolver(amountSchema),
  });

  const watchedAmount = watch('amount');
  const parsedAmount = Number(watchedAmount);
  const quoteStale = Boolean(
    selectedMerchant &&
      watchedAmount &&
      !Number.isNaN(parsedAmount) &&
      quoteMutation.data &&
      (quoteMutation.data.merchant.id !== selectedMerchant.id || quoteMutation.data.amount.amount !== parsedAmount),
  );

  useEffect(() => {
    setPayAmountText(watchedAmount);
  }, [setPayAmountText, watchedAmount]);

  useEffect(() => {
    if (selectedMerchant && !amountText) {
      setValue('amount', String(selectedMerchant.recommendedSpend.amount));
    }
  }, [amountText, selectedMerchant, setValue]);

  useEffect(() => {
    if (!selectedMerchant || Number.isNaN(Number(watchedAmount)) || Number(watchedAmount) <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      quoteMutation.mutate({
        amount: parsedAmount,
        merchantId: selectedMerchant.id,
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [parsedAmount, quoteMutation, selectedMerchant, watchedAmount]);

  useEffect(() => {
    if (!merchantId && !isLoading && !error) {
      router.replace('/pay');
    }
  }, [error, isLoading, merchantId]);

  if (isLoading) {
    return (
      <Screen ornament="pay" scroll={false}>
        <View style={{ gap: 18, paddingTop: 18 }}>
          <Skeleton height={18} width={80} />
          <Skeleton height={120} />
          <Skeleton height={360} />
        </View>
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="pay">
        <EmptyState
          actionLabel="Try again"
          description="The partner review surface did not load. Return to pay or refresh this quote context."
          icon={<Compass color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t prepare the payment"
        />
      </Screen>
    );
  }

  if (!selectedMerchant) {
    return (
      <Screen ornament="pay">
        <EmptyState
          actionLabel="Back to pay"
          description="The selected venue is no longer in this preview state. Return to partner pay and choose a venue again."
          icon={<MapPinned color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => router.replace('/pay')}
          title="Venue context expired"
        />
      </Screen>
    );
  }

  const venueTone = getVenueTonePalette(selectedMerchant.imageTone, theme);
  const actionMode =
    data.user.memberState === 'guest'
      ? 'join'
      : scenario === 'verificationPending'
        ? 'review'
        : data.user.memberState === 'member_preview'
          ? 'verify'
          : 'confirm';

  const onConfirm = handleSubmit(async () => {
    if (actionMode === 'join') {
      onboardingRef.current?.present();
      return;
    }

    if (actionMode === 'verify') {
      verificationRef.current?.present();
      return;
    }

    if (actionMode === 'review') {
      showToast({
        title: 'Verification still in review',
        description: 'Keep this venue selected and confirm once checks clear.',
      });
      return;
    }

    const quote =
      quoteMutation.data ??
      (await quoteMutation.mutateAsync({
        amount: Number(watchedAmount),
        merchantId: selectedMerchant.id,
      }));

    try {
      const receipt = await confirmMutation.mutateAsync(quote);
      setReceipt(receipt);
      await triggerHaptic(receipt.status === 'failed' ? 'error' : receipt.status === 'success' ? 'success' : 'soft');
      router.replace('/pay/status');
    } catch (err) {
      showToast({
        title: 'Could not confirm payment',
        description: err instanceof Error ? err.message : 'Try once more.',
        tone: 'error',
      });
    }
  });

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: 0 }} ornament="pay" scroll={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={16}
          style={styles.keyboardShell}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backRow}>
              <ChevronLeft color={theme.colors.primaryText} size={18} strokeWidth={2.1} />
              <Text variant="caption">Back</Text>
            </Pressable>

            <View style={styles.contextCard}>
              <View style={[styles.atmosphereCard, { backgroundColor: venueTone.solid }]}>
                <Text color="sheet" variant="caption">
                  Partner payment
                </Text>
                <Text color="sheet" style={styles.title} variant="display">
                  {selectedMerchant.name}
                </Text>
                <Text color="sheet" style={styles.atmosphereCopy}>
                  {selectedMerchant.vibe}
                </Text>
                <View style={styles.atmosphereMeta}>
                  <Text color="sheet" variant="caption">
                    {selectedMerchant.category}
                  </Text>
                  <Text color="sheet" variant="caption">
                    {selectedMerchant.distance}
                  </Text>
                </View>
              </View>
              <View style={styles.mapRow}>
                <MapPinned color={theme.colors.brass} size={18} strokeWidth={1.8} />
                <Text color="muted" style={{ flex: 1 }}>
                  {selectedMerchant.district}. Pay once, let the perk settle automatically, and leave the venue with a clean receipt.
                </Text>
              </View>
            </View>
          </View>

          <PaymentConfirmationSheet
            amountPresets={amountPresets}
            amountValue={watchedAmount}
            control={control}
            errors={errors}
            loading={confirmMutation.isPending}
            onSelectAmountPreset={(amount) => {
              void triggerHaptic('soft');
              setValue('amount', String(amount), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onSubmit={onConfirm}
            quote={quoteMutation.data ?? null}
            quoteLoading={quoteMutation.isPending}
            quoteStale={quoteStale}
            actionMode={actionMode}
          />
        </KeyboardAvoidingView>
      </Screen>

      <OnboardingGateSheet
        afterJoin={() => verificationRef.current?.present()}
        onJoined={() =>
          showToast({
            title: 'Member preview enabled',
            description: 'Verify next to unlock this partner payment.',
            tone: 'success',
          })
        }
        ref={onboardingRef}
      />
      <VerificationPromptSheet
        onPendingReview={() =>
          showToast({
            title: 'Verification moved to review',
            description: 'This payment stays paused until spend clears.',
          })
        }
        onVerified={() =>
          showToast({
            title: 'Spend unlocked',
            description: 'Confirm the payment once more to continue.',
            tone: 'success',
          })
        }
        ref={verificationRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  keyboardShell: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 8,
  },
  backRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    paddingBottom: 18,
  },
  contextCard: {
    gap: 14,
    paddingBottom: 28,
  },
  atmosphereCard: {
    borderRadius: 28,
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  title: {
    marginTop: 8,
    maxWidth: 320,
  },
  atmosphereCopy: {
    maxWidth: 280,
  },
  atmosphereMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  mapRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
