import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { ChevronRight, Compass, Headphones, LockKeyhole, ShieldCheck, Wallet } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MembershipStatusCard } from '../../components/MembershipStatusCard';
import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import { SupportCenterSheet } from '../../components/SupportCenterSheet';
import { TrustBanner } from '../../components/TrustBanner';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { VerificationStateChip } from '../../components/VerificationStateChip';
import { triggerHaptic } from '../../lib/haptics';
import { useProfileQuery, useSupportRequestsQuery } from '../../lib/queries';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Banner } from '../../ui/Banner';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function ProfileScreen() {
  const onboardingRef = useRef<BottomSheetModal>(null);
  const verificationRef = useRef<BottomSheetModal>(null);
  const supportCenterRef = useRef<BottomSheetModal>(null);
  const { data, error, isLoading, isRefetching, refetch } = useProfileQuery();
  const supportQuery = useSupportRequestsQuery();
  const { showToast } = useToast();
  const theme = useTheme();
  const supportPreviews = supportQuery.data ?? [];

  const handlePrimaryAction = () => {
    void triggerHaptic('soft');

    if (!data) {
      return;
    }

    if (data.user.memberState === 'guest') {
      onboardingRef.current?.present();
      return;
    }

    if (data.verificationState === 'verified') {
      router.push('/wallet');
      return;
    }

    if (data.verificationState === 'in_review') {
      showToast({
        title: 'Verification still in review',
        description: 'You can keep browsing the corridor while support watches the review queue.',
      });
      return;
    }

    verificationRef.current?.present();
  };

  if (isLoading) {
    return (
      <Screen ornament="wallet">
        <View style={styles.header}>
          <Skeleton height={18} width={96} />
          <Skeleton height={44} radius={24} style={{ marginTop: 18 }} width="68%" />
          <Skeleton height={18} style={{ marginTop: 10 }} width="82%" />
        </View>
        <Skeleton height={220} />
        <Skeleton height={180} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="wallet">
        <EmptyState
          actionLabel="Try again"
          description="The trust surface didn’t load. Refresh and account state should settle back in."
          icon={<ShieldCheck color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t load profile"
        />
      </Screen>
    );
  }

  const primaryLabel =
    data.user.memberState === 'guest'
      ? 'Join the network'
      : data.verificationState === 'verified'
        ? 'Open wallet'
        : data.verificationState === 'in_review'
          ? 'Verification in review'
          : 'Verify to unlock spend';

  return (
    <>
      <Screen onRefresh={() => refetch()} ornament="wallet" refreshing={isRefetching}>
        <Reveal style={styles.header}>
          <Text color="muted" variant="caption">
            Profile
          </Text>
          <Text style={styles.title} variant="display">
            Trust and account state, kept quiet.
          </Text>
          <Text color="muted" style={styles.copy}>
            This is where membership status, verification, support, and funding readiness come together without exposing the rails underneath.
          </Text>
        </Reveal>

        <Reveal delay={60}>
          <Card variant="hero">
            <View style={styles.identityTopRow}>
              <View style={styles.identityCopy}>
                <Text color="muted" variant="caption">
                  {data.corridor.label}
                </Text>
                <Text style={styles.identityName} variant="display">
                  {data.user.firstName}
                </Text>
                <Text color="muted">
                  {data.user.homeCity} home base. Currently landing in {data.user.currentCity}.
                </Text>
              </View>
              <VerificationStateChip state={data.verificationState} />
            </View>

            <View style={styles.identityActions}>
              <Button
                disabled={data.verificationState === 'in_review'}
                label={primaryLabel}
                onPress={handlePrimaryAction}
              />
            </View>
          </Card>
        </Reveal>

        <Reveal delay={100} style={styles.section}>
          <TrustBanner tone={data.trustState} />
        </Reveal>

        <Reveal delay={150} style={styles.section}>
          <SectionHeader
            actionLabel="Open membership"
            eyebrow="Membership"
            onActionPress={() => router.push('/membership')}
            subtitle="Status should feel like belonging, not a gamified dashboard."
            title="Inside the network"
          />
          <MembershipStatusCard profile={data.memberProfile} />
        </Reveal>

        <Reveal delay={200} style={styles.section}>
          <SectionHeader
            eyebrow="Funding"
            subtitle="Only the funding state that matters right now should be visible."
            title="Payment access"
          />
          <Card variant="default">
            <View style={styles.list}>
              {data.paymentMethods.map((method, index) => (
                <View
                  key={method.id}
                  style={[
                    styles.methodRow,
                    index < data.paymentMethods.length - 1
                      ? { borderBottomColor: theme.colors.softLine, borderBottomWidth: StyleSheet.hairlineWidth }
                      : null,
                  ]}>
                  <View style={[styles.iconWrap, { backgroundColor: theme.colors.elevated }]}>
                    <Wallet color={theme.colors.brass} size={16} strokeWidth={1.9} />
                  </View>
                  <View style={styles.methodCopy}>
                    <Text variant="label">{method.label}</Text>
                    <Text color="muted" style={styles.methodDetail}>
                      {method.detail}
                    </Text>
                  </View>
                  <VerificationStateChip
                    state={
                      method.state === 'ready'
                        ? 'verified'
                        : data.verificationState === 'in_review'
                          ? 'in_review'
                          : 'unstarted'
                    }
                  />
                </View>
              ))}
            </View>
          </Card>
        </Reveal>

        <Reveal delay={250} style={styles.section}>
          <SectionHeader
            eyebrow="Support"
            subtitle="Support should anchor trust, not feel like a last-resort utility."
            title="When something needs help"
          />
          <Banner
            description={data.supportDetail}
            icon={<Headphones color={theme.colors.brass} size={18} strokeWidth={1.8} />}
            title={data.supportStatus}
          />
        </Reveal>

        <Reveal delay={300} style={styles.section}>
          <SectionHeader
            eyebrow="Privacy"
            subtitle="The account should explain what stays abstracted."
            title="What stays hidden"
          />
          <Card variant="quiet">
            <View style={styles.privacyRow}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.sheet }]}>
                <LockKeyhole color={theme.colors.primaryText} size={16} strokeWidth={1.9} />
              </View>
              <View style={styles.privacyCopy}>
                <Text variant="label">Embedded wallet and rails</Text>
                <Text color="muted">{data.privacyNote}</Text>
              </View>
            </View>
          </Card>
        </Reveal>

        <Reveal delay={340} style={styles.section}>
          <Pressable
            accessibilityRole="button"
            onPress={() => supportCenterRef.current?.present()}
            style={[styles.supportRow, { borderColor: theme.colors.softLine, backgroundColor: theme.colors.elevated }]}>
            <View style={styles.supportCopy}>
              <Text variant="label">Open help and receipts</Text>
              <Text color="muted">
                {supportPreviews.length
                  ? `${supportPreviews.length} receipt-linked request${supportPreviews.length > 1 ? 's' : ''} already attached here.`
                  : 'Corridor receipts, refunds, and venue issues would route through this support surface next.'}
              </Text>
            </View>
            <ChevronRight color={theme.colors.mutedText} size={16} strokeWidth={2} />
          </Pressable>
        </Reveal>
      </Screen>

      <OnboardingGateSheet
        afterJoin={() => verificationRef.current?.present()}
        onJoined={() =>
          showToast({
            title: 'Member preview enabled',
            description: 'Profile now shows the corridor as a preview account.',
            tone: 'success',
          })
        }
        ref={onboardingRef}
      />
      <VerificationPromptSheet
        onPendingReview={() =>
          showToast({
            title: 'Verification moved to review',
            description: 'Profile will now reflect the hold state until spend clears.',
          })
        }
        onVerified={() =>
          showToast({
            title: 'Spend unlocked',
            description: 'Profile and wallet are now both live for corridor spend in this prototype.',
            tone: 'success',
          })
        }
        ref={verificationRef}
      />
      <SupportCenterSheet detail={data.supportDetail} headline={data.supportStatus} previews={supportPreviews} ref={supportCenterRef} />
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
  copy: {
    marginTop: 12,
    maxWidth: 332,
  },
  section: {
    marginTop: 24,
  },
  identityTopRow: {
    gap: 14,
  },
  identityCopy: {
    gap: 6,
  },
  identityName: {
    marginTop: 2,
  },
  identityActions: {
    marginTop: 22,
  },
  list: {
    gap: 4,
  },
  methodRow: {
    alignItems: 'center',
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
  methodCopy: {
    flex: 1,
    paddingRight: 12,
  },
  methodDetail: {
    marginTop: 3,
  },
  privacyRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  privacyCopy: {
    flex: 1,
    gap: 4,
  },
  supportRow: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  supportCopy: {
    flex: 1,
    gap: 4,
  },
});
