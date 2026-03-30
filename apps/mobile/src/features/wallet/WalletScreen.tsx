import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Compass, ShieldCheck } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityRow } from '../../components/ActivityRow';
import { AddMoneySheet } from '../../components/AddMoneySheet';
import { BalanceCard } from '../../components/BalanceCard';
import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import { PendingStateBlock } from '../../components/PendingStateBlock';
import { TrustBanner } from '../../components/TrustBanner';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { triggerHaptic } from '../../lib/haptics';
import { useWalletQuery } from '../../lib/queries';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { EmptyState } from '../../ui/EmptyState';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function WalletScreen() {
  const addMoneyRef = useRef<BottomSheetModal>(null);
  const onboardingRef = useRef<BottomSheetModal>(null);
  const verificationRef = useRef<BottomSheetModal>(null);
  const { showToast } = useToast();
  const { data, error, isLoading, isRefetching, refetch } = useWalletQuery();
  const theme = useTheme();

  const openFunding = () => {
    void triggerHaptic('soft');

    if (data?.user.memberState === 'guest') {
      onboardingRef.current?.present();
      return;
    }

    if (data?.verificationState === 'in_review') {
      showToast({
        title: 'Verification still in review',
        description: 'Funding unlocks as soon as the review clears.',
      });
      return;
    }

    if (data?.user.memberState === 'member_preview') {
      verificationRef.current?.present();
      return;
    }

    addMoneyRef.current?.present();
  };

  if (isLoading) {
    return (
      <Screen ornament="wallet">
        <Skeleton height={222} />
        <Skeleton height={96} style={{ marginTop: 20 }} />
        <Skeleton height={164} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="wallet">
        <EmptyState
          actionLabel="Try again"
          description="The wallet surface didn’t resolve. Reload to restore balance and activity states."
          icon={<ShieldCheck color={theme.colors.brass} size={22} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t load wallet"
        />
      </Screen>
    );
  }

  return (
    <>
      <Screen onRefresh={() => refetch()} ornament="wallet" refreshing={isRefetching}>
        <Reveal style={styles.header}>
          <Text color="muted" variant="caption">
            Wallet
          </Text>
          <Text style={styles.title} variant="display">
            Trust, without the noise.
          </Text>
        </Reveal>

        <Reveal delay={60}>
          <BalanceCard
            balance={data.balance}
            ctaDisabled={data.verificationState === 'in_review'}
            ctaLabel={
              data.user.memberState === 'guest'
                ? 'Join to unlock balance'
                : data.verificationState === 'in_review'
                  ? 'Verification in review'
                  : data.user.memberState === 'member_preview'
                    ? 'Verify to unlock spend'
                    : 'Add money'
            }
            onAddMoney={openFunding}
          />
        </Reveal>

        <Reveal delay={120} style={styles.section}>
          <TrustBanner tone={data.trustState} />
        </Reveal>

        {data.balance.pending.amount > 0 ? (
          <Reveal delay={180} style={styles.section}>
            <PendingStateBlock amount={data.balance.pending} />
          </Reveal>
        ) : null}

        <Reveal delay={240} style={styles.section}>
          <SectionHeader eyebrow="Trusted movement" subtitle="Only the states that matter should show up here." title="Recent activity" />
          {data.activity.length ? (
            data.activity.map((item) => <ActivityRow item={item} key={item.id} />)
          ) : (
            <EmptyState
              actionLabel={
                data.user.memberState === 'guest'
                  ? 'Join the network'
                  : data.verificationState === 'in_review'
                    ? 'Verification in review'
                    : data.user.memberState === 'member_preview'
                      ? 'Verify to unlock spend'
                      : 'Add money'
              }
              description={
                data.user.memberState === 'guest'
                  ? 'Browse first, then turn on your travel balance when you are ready to spend.'
                  : data.verificationState === 'in_review'
                    ? 'Verification is still clearing. Balance movement will appear once funding and spend unlock.'
                    : data.user.memberState === 'member_preview'
                      ? 'Verify when you are ready to activate funding, partner checkout, and the full receipt trail.'
                      : 'Your first corridor spend, refund, or split will appear here with calm state labels.'
              }
              icon={<Compass color={theme.colors.brass} size={20} strokeWidth={1.8} />}
              onActionPress={openFunding}
              title={
                data.user.memberState === 'guest'
                  ? 'Guest mode keeps this empty'
                  : data.verificationState === 'in_review'
                    ? 'Spend unlocks after review'
                    : data.user.memberState === 'member_preview'
                      ? 'Verify to activate balance'
                      : 'No movement yet'
              }
            />
          )}
        </Reveal>
      </Screen>

      <OnboardingGateSheet
        afterJoin={() => verificationRef.current?.present()}
        onJoined={() =>
          showToast({
            title: 'Member preview enabled',
            description: 'Verify next when you are ready to activate funding.',
            tone: 'success',
          })
        }
        ref={onboardingRef}
      />
      <VerificationPromptSheet
        afterVerified={() => addMoneyRef.current?.present()}
        onPendingReview={() =>
          showToast({
            title: 'Verification moved to review',
            description: 'Funding stays paused while the review state is visible.',
          })
        }
        onVerified={() =>
          showToast({
            title: 'Spend unlocked',
            description: 'You can now queue a top-up in this prototype.',
            tone: 'success',
          })
        }
        ref={verificationRef}
      />
      <AddMoneySheet
        onQueued={(amountLabel) =>
          showToast({
            title: 'Top-up in progress',
            description: `${amountLabel} is now visible as pending funds in the wallet.`,
          })
        }
        ref={addMoneyRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  title: {
    marginTop: 14,
    maxWidth: 320,
  },
  section: {
    marginTop: 22,
  },
});
