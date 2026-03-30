import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Clock3 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { FailedTransactionState } from '../../components/FailedTransactionState';
import { PendingStateBlock } from '../../components/PendingStateBlock';
import { SplitFollowUpSheet } from '../../components/SplitFollowUpSheet';
import { SuccessStateSheet } from '../../components/SuccessStateSheet';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { BottomActionBar } from '../../ui/BottomActionBar';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';

export function PayStatusScreen() {
  const splitRef = useRef<BottomSheetModal>(null);
  const receipt = useScenarioStore((state) => state.lastReceipt);
  const clearPayDraft = useScenarioStore((state) => state.clearPayDraft);
  const createSplitPreview = useScenarioStore((state) => state.createSplitPreview);
  const { showToast } = useToast();
  const theme = useTheme();

  useEffect(() => {
    if (!receipt) {
      router.replace('/pay');
    }
  }, [receipt]);

  if (!receipt) {
    return null;
  }

  if (receipt.status === 'failed') {
    return (
      <Screen contentContainerStyle={{ justifyContent: 'flex-end', paddingBottom: 0 }} ornament="pay" scroll={false}>
        <Reveal>
          <FailedTransactionState merchantName={receipt.merchant.name} onBack={() => router.replace('/pay')} onRetry={() => router.replace('/pay/confirm')} />
        </Reveal>
      </Screen>
    );
  }

  if (receipt.status === 'pending') {
    return (
      <Screen contentContainerStyle={{ justifyContent: 'flex-end', paddingBottom: 0 }} ornament="pay" scroll={false}>
        <Reveal>
          <Card style={styles.pendingCard} variant="hero">
            <Clock3 color={theme.colors.pending} size={28} strokeWidth={1.9} />
            <Text style={styles.pendingTitle} variant="display">
              Still settling.
            </Text>
            <Text color="muted">
              The venue already sees your payment intent. We are waiting for the final settlement confirmation before it drops into activity as settled.
            </Text>
            <PendingStateBlock amount={receipt.total} kind="payment" />
          </Card>
        </Reveal>
        <BottomActionBar>
          <Button
            label="Back to home"
            onPress={() => {
              clearPayDraft();
              router.replace('/');
            }}
          />
        </BottomActionBar>
      </Screen>
    );
  }

  return (
    <>
      <Screen contentContainerStyle={{ justifyContent: 'flex-end', paddingBottom: 0 }} ornament="pay" scroll={false}>
        <Reveal>
          <SuccessStateSheet
            onDone={() => {
              clearPayDraft();
              router.replace('/');
            }}
            onPayAgain={() => router.replace('/pay')}
            onSplitBill={receipt.merchant.category === 'Dinner' ? () => splitRef.current?.present() : undefined}
            receipt={receipt}
          />
        </Reveal>
      </Screen>
      {receipt.merchant.category === 'Dinner' ? (
        <SplitFollowUpSheet
          onSendSplit={() => {
            createSplitPreview(receipt, 3);
            showToast({
              title: 'Split requests sent',
              description: 'You can now see the pending split settle back into activity across the corridor.',
              tone: 'success',
            });
            clearPayDraft();
            router.replace('/');
          }}
          receipt={receipt}
          ref={splitRef}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pendingCard: {
    gap: 16,
    paddingBottom: 28,
  },
  pendingTitle: {
    marginTop: 6,
  },
});
