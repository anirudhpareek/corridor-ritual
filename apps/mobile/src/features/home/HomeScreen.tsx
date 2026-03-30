import type { Perk, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Compass, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityRow } from '../../components/ActivityRow';
import { AddMoneySheet } from '../../components/AddMoneySheet';
import { CityMomentCard } from '../../components/CityMomentCard';
import { MembershipStatusCard } from '../../components/MembershipStatusCard';
import { OnboardingGateSheet } from '../../components/OnboardingGateSheet';
import { TravelSignalCard } from '../../components/TravelSignalCard';
import { TrustBanner } from '../../components/TrustBanner';
import { VerificationPromptSheet } from '../../components/VerificationPromptSheet';
import { VenueDetailSheet } from '../../components/VenueDetailSheet';
import { VenueCard } from '../../components/VenueCard';
import { triggerHaptic } from '../../lib/haptics';
import { useHomeQuery } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Button } from '../../ui/Button';
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
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const { showToast } = useToast();
  const { data, error, isLoading, isRefetching, refetch } = useHomeQuery();
  const theme = useTheme();
  const scenario = useScenarioStore((state) => state.scenario);
  const setPayMerchant = useScenarioStore((state) => state.setPayMerchant);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);

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
  const homeMoments = data
    ? [
        data.activity.find((item) => item.kind === 'split'),
        data.activity.find((item) => item.kind !== 'split'),
      ].filter((item): item is NonNullable<(typeof data.activity)[number]> => Boolean(item))
    : [];

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
                  <VenueCard key={venue.id} onPress={() => handleOpenVenueDetail(venue)} venue={venue} />
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

        <Reveal delay={350} style={styles.section}>
          <SectionHeader
            actionLabel="Open wallet"
            eyebrow="With your circle"
            onActionPress={() => router.push('/wallet')}
            subtitle="Social movement belongs here before the full ledger does."
            title="Recent rhythm"
          />
          {homeMoments.length ? (
            homeMoments.map((item) => <ActivityRow item={item} key={item.id} />)
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
      <VenueDetailSheet onPrimaryAction={handlePaySelectedVenue} perk={selectedPerk} ref={venueDetailRef} venue={selectedVenue} />
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
});
