import type { ActivityItem, Perk, SplitRequest, SupportRequestPreview, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Compass, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityRow } from '../../components/ActivityRow';
import { ActivityDetailSheet } from '../../components/ActivityDetailSheet';
import { AddMoneySheet } from '../../components/AddMoneySheet';
import { CityMomentCard } from '../../components/CityMomentCard';
import { MembershipStatusCard } from '../../components/MembershipStatusCard';
import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import { SplitCard } from '../../components/SplitCard';
import { SplitActivitySheet } from '../../components/SplitActivitySheet';
import { TravelSignalCard } from '../../components/TravelSignalCard';
import { TrustBanner } from '../../components/TrustBanner';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { SupportIssueSheet } from '../../components/SupportIssueSheet';
import { SupportRequestDetailSheet } from '../../components/SupportRequestDetailSheet';
import { VenueDetailSheet } from '../../components/VenueDetailSheet';
import { VenueCard } from '../../components/VenueCard';
import { triggerHaptic } from '../../lib/haptics';
import { useHomeQuery, useSavedStateQuery, useSplitRequestsQuery, useSupportRequestsQuery } from '../../lib/queries';
import { getSplitHomeMoment } from '../../lib/splits';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { Screen } from '../../ui/Screen';
import { Reveal } from '../../ui/Reveal';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function HomeScreen() {
  const addMoneyRef = useRef<BottomSheetModal>(null);
  const onboardingRef = useRef<BottomSheetModal>(null);
  const verificationRef = useRef<BottomSheetModal>(null);
  const venueDetailRef = useRef<BottomSheetModal>(null);
  const activityDetailRef = useRef<BottomSheetModal>(null);
  const supportIssueRef = useRef<BottomSheetModal>(null);
  const supportRequestDetailRef = useRef<BottomSheetModal>(null);
  const splitActivityRef = useRef<BottomSheetModal>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<SplitRequest | null>(null);
  const [selectedSupportPreview, setSelectedSupportPreview] = useState<SupportRequestPreview | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const { showToast } = useToast();
  const { data, error, isLoading, isRefetching, refetch } = useHomeQuery();
  const splitQuery = useSplitRequestsQuery();
  const savedStateQuery = useSavedStateQuery();
  const supportQuery = useSupportRequestsQuery();
  const theme = useTheme();
  const scenario = useScenarioStore((state) => state.scenario);
  const setPayMerchant = useScenarioStore((state) => state.setPayMerchant);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);
  const createSupportPreview = useScenarioStore((state) => state.createSupportPreview);
  const toggleVenueSaved = useScenarioStore((state) => state.toggleVenueSaved);

  const trustTone =
    scenario === 'guest'
      ? 'guest'
      : scenario === 'memberPreview'
        ? 'member_preview'
      : scenario === 'verificationPending'
        ? 'verification_pending'
        : scenario === 'pendingFunds'
          ? 'pending_funds'
          : 'calm';
  const featuredVenue = data?.venues[0] ?? null;
  const featuredPerk =
    (featuredVenue ? data?.perks.find((perk) => perk.id === featuredVenue.featuredPerkId) : null) ?? data?.perks[0] ?? null;
  const latestSplit = splitQuery.data?.[0] ?? null;
  const savedState = savedStateQuery.data ?? { perkIds: [], tripIds: [], venueIds: [] };
  const supportCount = supportQuery.data?.length ?? 0;
  const supportPreviews = supportQuery.data ?? [];
  const homeMoments = data ? data.activity.filter((item) => item.kind !== 'split').slice(0, 2) : [];
  const savedVenue = data?.venues.find((venue) => savedState.venueIds.includes(venue.id)) ?? null;
  const savedPerk = data?.perks.find((perk) => savedState.perkIds.includes(perk.id)) ?? null;
  const runSaved = data ? savedState.tripIds.includes(data.travelSignal.id) : false;
  const existingSupportPreview =
    selectedActivity ? supportPreviews.find((preview) => preview.sourceActivityId === selectedActivity.id) ?? null : null;
  const latestSplitMoment = latestSplit ? getSplitHomeMoment(latestSplit.status) : null;

  const handleAddMoney = () => {
    void triggerHaptic('soft');

    if (data?.user.memberState === 'guest') {
      onboardingRef.current?.present();
      return;
    }

    if (scenario === 'verificationPending') {
      showToast({
        title: 'Verification still in review',
        description: 'You can keep browsing the corridor while spend access is being cleared.',
      });
      return;
    }

    if (data?.user.memberState === 'member_preview') {
      verificationRef.current?.present();
      return;
    }

    addMoneyRef.current?.present();
  };

  const handleOpenPay = () => {
    void triggerHaptic('soft');
    router.push('/pay');
  };

  const handleOpenVenueDetail = (venue: Venue) => {
    if (!data) {
      return;
    }

    void triggerHaptic('soft');
    setSelectedVenue(venue);
    setSelectedPerk(data.perks.find((perk) => perk.id === venue.featuredPerkId) ?? null);
    venueDetailRef.current?.present();
  };

  const handlePaySelectedVenue = () => {
    if (!selectedVenue) {
      return;
    }

    void triggerHaptic('soft');
    setPayMerchant(selectedVenue.id);
    setPayAmountText(String(selectedVenue.recommendedSpend.amount));
    venueDetailRef.current?.dismiss();
    router.push('/pay/confirm');
  };

  const handleOpenActivityDetail = (item: ActivityItem) => {
    if (item.kind === 'split' && item.relatedSplitId) {
      void triggerHaptic('soft');
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
      <Screen ornament="home">
        <View style={styles.heroBlock}>
          <Skeleton height={18} width={110} />
          <Skeleton height={44} radius={24} style={{ marginTop: 18 }} width="72%" />
          <Skeleton height={18} style={{ marginTop: 10 }} width="88%" />
        </View>
        <Skeleton height={190} />
        <Skeleton height={182} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="home">
        <EmptyState
          actionLabel="Try again"
          description="The corridor briefing didn’t load. Refresh and the curated route should settle back in."
          icon={<Compass color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t load the corridor"
        />
      </Screen>
    );
  }

  return (
    <>
      <Screen onRefresh={() => refetch()} ornament="home" refreshing={isRefetching}>
        <Reveal style={styles.heroBlock}>
          <Text color="muted" variant="caption">
            {data.corridor.label}
          </Text>
          <View style={[styles.routeStrip, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <View>
              <Text color="muted" variant="caption">
                Home base
              </Text>
              <Text variant="label">{data.corridor.homeCity}</Text>
            </View>
            <View style={styles.routeTrack}>
              <View style={[styles.routeDot, { backgroundColor: theme.colors.brass }]} />
              <View style={[styles.routeLine, { backgroundColor: theme.colors.softLine }]} />
              <View style={[styles.routeDot, { backgroundColor: theme.colors.forest }]} />
            </View>
            <View style={styles.routeArrival}>
              <Text color="muted" variant="caption">
                Now landing
              </Text>
              <Text variant="label">{data.user.currentCity}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle} variant="display">
            A calmer way to land in {data.corridor.destinationCity}.
          </Text>
          <Text color="brass" style={styles.heroRhythm} variant="caption">
            {data.corridor.rhythm}
          </Text>
          <Text color="muted" style={styles.heroCopy}>
            Spend at familiar tables, move quietly through partner venues, and keep the corridor close even when the trip is short.
          </Text>
          <View style={styles.heroActions}>
            <Button label="Pay a partner" onPress={handleOpenPay} />
            <Pressable accessibilityRole="button" onPress={handleAddMoney} style={styles.heroSecondaryAction}>
              <Text color="muted" variant="caption">
                {data.user.memberState === 'guest'
                  ? 'Want corridor spend later?'
                  : scenario === 'verificationPending'
                    ? 'Spend is still unlocking'
                    : data.user.memberState === 'member_preview'
                      ? 'Ready to fund and spend?'
                      : 'Need balance first?'}
              </Text>
              <Text color="brass" variant="label">
                {data.user.memberState === 'guest'
                  ? 'Join first'
                  : scenario === 'verificationPending'
                    ? 'Verification in review'
                    : data.user.memberState === 'member_preview'
                      ? 'Verify to add money'
                      : 'Add money'}
              </Text>
            </Pressable>
          </View>
        </Reveal>

        <Reveal delay={50}>
          <TrustBanner tone={trustTone} />
        </Reveal>

        <Reveal delay={100} style={styles.section}>
          <SectionHeader
            eyebrow="Tonight"
            subtitle="A single partner moment should be obvious the minute you open the app."
            title={`Tonight in ${data.user.currentCity}`}
          />
          {featuredVenue ? (
            <CityMomentCard city={data.user.currentCity} onPress={handleOpenPay} perk={featuredPerk} venue={featuredVenue} />
          ) : (
            <EmptyState
              description="When the corridor is live in a city, one clear partner moment should show up here first."
              title="No city moment yet"
            />
          )}
        </Reveal>

        <Reveal delay={150} style={styles.section}>
          <SectionHeader
            actionLabel="Open membership"
            eyebrow="Your status"
            onActionPress={() => router.push('/membership')}
            subtitle="Belonging should feel legible before any wallet detail."
            title="Inside the corridor"
          />
          <MembershipStatusCard profile={data.memberProfile} />
        </Reveal>

        <Reveal delay={250} style={styles.section}>
          <SectionHeader eyebrow="Also nearby" subtitle="Curated, not marketplace-chaotic." title="Other partner venues" />
          {data.venues.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.venueRail}>
                {data.venues.slice(1).map((venue) => (
                  <VenueCard
                    key={venue.id}
                    onPress={() => handleOpenVenueDetail(venue)}
                    saved={savedState.venueIds.includes(venue.id)}
                    venue={venue}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <EmptyState
              description="As the network fills out, this rail will keep only the venues that matter on repeat trips."
              title="No partner venues in this preview"
            />
          )}
        </Reveal>

        <Reveal delay={300} style={styles.section}>
          <SectionHeader
            eyebrow="This trip"
            subtitle="Travel utility belongs here only when it sharpens corridor relevance."
            title={data.travelSignal.routeLabel}
          />
          <TravelSignalCard signal={data.travelSignal} />
        </Reveal>

        {savedVenue || savedPerk || runSaved ? (
          <Reveal delay={320} style={styles.section}>
            <SectionHeader
              actionLabel="Open trips"
              eyebrow="Kept close"
              onActionPress={() => router.push('/trips')}
              subtitle="A few saved choices should tighten the next run, not create a collection to manage."
              title="Saved for this run"
            />
            <Card variant="quiet">
              <View style={styles.savedHeader}>
                <View style={styles.savedBadges}>
                  {runSaved ? <Badge label="Route saved" tone="forest" /> : null}
                  {savedVenue ? <Badge label="Venue kept close" tone="neutral" /> : null}
                  {savedPerk ? <Badge label="Perk saved" tone="brass" /> : null}
                </View>
              </View>
              {savedVenue ? (
                <Text style={styles.savedLine} variant="label">
                  {savedVenue.name} stays visible for arrival in {savedVenue.district}.
                </Text>
              ) : null}
              {savedPerk ? (
                <Text color="muted">
                  {savedPerk.title} will stay attached to the corridor instead of disappearing into a long benefits list.
                </Text>
              ) : null}
              {!savedVenue && !savedPerk ? (
                <Text color="muted">
                  The route itself is pinned, so the next trip stays tight even before you pick a table.
                </Text>
              ) : null}
            </Card>
          </Reveal>
        ) : null}

        {latestSplit ? (
          <Reveal delay={340} style={styles.section}>
            <SectionHeader
              actionLabel={latestSplitMoment?.actionLabel}
              eyebrow="With your circle"
              onActionPress={() => {
                setSelectedSplit(latestSplit);
                splitActivityRef.current?.present();
              }}
              subtitle={latestSplitMoment?.subtitle}
              title={latestSplitMoment?.title ?? 'One table still moving'}
            />
            <SplitCard
              onPress={() => {
                setSelectedSplit(latestSplit);
                splitActivityRef.current?.present();
              }}
              split={latestSplit}
            />
          </Reveal>
        ) : null}

        <Reveal delay={380} style={styles.section}>
          <SectionHeader
            actionLabel={supportCount ? `${supportCount} request${supportCount > 1 ? 's' : ''} live` : 'Open wallet'}
            eyebrow="Recent rhythm"
            onActionPress={() => router.push(supportCount ? '/profile' : '/wallet')}
            subtitle="The latest spend should stay short, legible, and easy to trust."
            title="Recent rhythm"
          />
          {homeMoments.length ? (
            homeMoments.map((item) => <ActivityRow item={item} key={item.id} onPress={() => handleOpenActivityDetail(item)} />)
          ) : (
            <EmptyState
              description="Dinner splits, partner spend, and corridor movement will show up here once you start using the network."
              icon={<Sparkles color={theme.colors.brass} size={20} strokeWidth={1.8} />}
              title="No social movement yet"
            />
          )}
        </Reveal>
      </Screen>

      <OnboardingGateSheet
        afterJoin={() => verificationRef.current?.present()}
        onJoined={() =>
          showToast({
            title: 'Member preview enabled',
            description: 'Browse stays open. Verify only when you are ready to fund and spend.',
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
            description: 'The hold state is now visible while corridor spend stays paused.',
          })
        }
        onVerified={() =>
          showToast({
            title: 'Spend unlocked',
            description: 'Funding is now available in this prototype.',
            tone: 'success',
          })
        }
        ref={verificationRef}
      />
      <AddMoneySheet
        onQueued={(amountLabel) =>
          showToast({
            title: 'Demo top-up queued',
            description: `${amountLabel} is now moving through a pending settlement state.`,
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
      <VenueDetailSheet
        onPrimaryAction={handlePaySelectedVenue}
        onToggleSaved={() => {
          if (!selectedVenue) {
            return;
          }

          const isSaved = savedState.venueIds.includes(selectedVenue.id);
          toggleVenueSaved(selectedVenue.id);
          showToast({
            title: isSaved ? 'Venue removed' : 'Venue kept close',
            description: isSaved
              ? `${selectedVenue.name} is no longer pinned for this run.`
              : `${selectedVenue.name} now stays visible across the corridor.`,
            tone: 'success',
          });
        }}
        perk={selectedPerk}
        ref={venueDetailRef}
        saved={selectedVenue ? savedState.venueIds.includes(selectedVenue.id) : false}
        venue={selectedVenue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  heroBlock: {
    paddingBottom: 12,
    paddingTop: 8,
  },
  heroTitle: {
    marginTop: 16,
    maxWidth: 320,
  },
  routeStrip: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  routeTrack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  routeDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  routeLine: {
    borderRadius: 999,
    flex: 1,
    height: 2,
  },
  routeArrival: {
    alignItems: 'flex-end',
  },
  heroRhythm: {
    marginTop: 10,
  },
  heroCopy: {
    marginTop: 14,
    maxWidth: 330,
  },
  heroActions: {
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
  },
  heroSecondaryAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 30,
    paddingHorizontal: 4,
  },
  section: {
    marginTop: 26,
  },
  venueRail: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 20,
  },
  savedHeader: {
    marginBottom: 10,
  },
  savedBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedLine: {
    marginBottom: 6,
  },
});
