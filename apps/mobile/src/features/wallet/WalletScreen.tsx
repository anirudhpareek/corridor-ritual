import type { ActivityItem, SplitRequest, SupportRequestPreview } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Compass, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityRow } from '../../components/ActivityRow';
import { ActivityDetailSheet } from '../../components/ActivityDetailSheet';
import { AddMoneySheet } from '../../components/AddMoneySheet';
import { BalanceCard } from '../../components/BalanceCard';
import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import { PendingStateBlock } from '../../components/PendingStateBlock';
import { SupportIssueSheet } from '../../components/SupportIssueSheet';
import { SupportRequestDetailSheet } from '../../components/SupportRequestDetailSheet';
import { SplitActivitySheet } from '../../components/SplitActivitySheet';
import { TrustBanner } from '../../components/TrustBanner';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { triggerHaptic } from '../../lib/haptics';
import { useSplitRequestsQuery, useSupportRequestsQuery, useWalletQuery } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
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
  const activityDetailRef = useRef<BottomSheetModal>(null);
  const supportIssueRef = useRef<BottomSheetModal>(null);
  const splitActivityRef = useRef<BottomSheetModal>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<SplitRequest | null>(null);
  const [selectedSupportPreview, setSelectedSupportPreview] = useState<SupportRequestPreview | null>(null);
  const supportRequestDetailRef = useRef<BottomSheetModal>(null);
  const { showToast } = useToast();
  const { data, error, isLoading, isRefetching, refetch } = useWalletQuery();
  const supportQuery = useSupportRequestsQuery();
  const splitQuery = useSplitRequestsQuery();
  const theme = useTheme();
  const createSupportPreview = useScenarioStore((state) => state.createSupportPreview);
  const supportPreviews = supportQuery.data ?? [];
  const supportCount = supportPreviews.length;
  const existingSupportPreview =
    selectedActivity ? supportPreviews.find((preview) => preview.sourceActivityId === selectedActivity.id) ?? null : null;

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

  const handleOpenActivityDetail = (item: ActivityItem) => {
    if (item.kind === 'split' && item.relatedSplitId) {
      void triggerHaptic('soft');
      const relatedSplit = splitQuery.data?.find((split) => split.id === item.relatedSplitId) ?? null;

      if (relatedSplit) {
        setSelectedSplit(relatedSplit);
        splitActivityRef.current?.present();
        return;
      }

      router.push(`/split/${item.relatedSplitId}`);
      return;
    }

    void triggerHaptic('soft');
    setSelectedSupportPreview(null);
    setSelectedActivity(item);
    activityDetailRef.current?.present();
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
          <SectionHeader
            actionLabel={supportCount ? `${supportCount} request${supportCount > 1 ? 's' : ''} live` : undefined}
            eyebrow="Trusted movement"
            onActionPress={supportCount ? () => router.push('/profile') : undefined}
            subtitle="Only the states that matter should show up here."
            title="Recent activity"
          />
          {data.activity.length ? (
            data.activity.map((item) => <ActivityRow item={item} key={item.id} onPress={() => handleOpenActivityDetail(item)} />)
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
      <ActivityDetailSheet
        item={selectedActivity}
        onSupportPress={() => {
          activityDetailRef.current?.dismiss();
          if (existingSupportPreview) {
            setSelectedSupportPreview(existingSupportPreview);
            supportRequestDetailRef.current?.present();
            return;
          }

          supportIssueRef.current?.present();
        }}
        supportActionLabel={existingSupportPreview ? 'View support request' : 'Open support'}
        ref={activityDetailRef}
      />
      <SupportIssueSheet
        item={selectedActivity}
        onSubmit={(reason) => {
          supportIssueRef.current?.dismiss();
          if (selectedActivity) {
            const preview = createSupportPreview({
              amount: selectedActivity.amount,
              direction: selectedActivity.direction,
              movementKind: selectedActivity.kind,
              movementStatus: selectedActivity.status,
              reason,
              sourceActivityId: selectedActivity.id,
              receiptSubtitle: selectedActivity.subtitle,
              receiptTitle: selectedActivity.title,
            });
            setSelectedSupportPreview(preview);
          }
          supportRequestDetailRef.current?.present();
          showToast({
            title: 'Support request staged',
            description: `${reason} is now attached to ${selectedActivity?.title ?? 'this receipt'} in the prototype.`,
            tone: 'success',
          });
        }}
        ref={supportIssueRef}
      />
      <SupportRequestDetailSheet preview={selectedSupportPreview} ref={supportRequestDetailRef} />
      <SplitActivitySheet
        onOpenSplit={() => {
          if (!selectedSplit) {
            return;
          }

          splitActivityRef.current?.dismiss();
          router.push(`/split/${selectedSplit.id}`);
        }}
        ref={splitActivityRef}
        split={selectedSplit}
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
