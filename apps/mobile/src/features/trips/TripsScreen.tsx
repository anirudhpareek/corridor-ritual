import type { Perk, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Compass, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TravelSignalCard } from '../../components/TravelSignalCard';
import { TripMomentCard } from '../../components/TripMomentCard';
import { TrustBanner } from '../../components/TrustBanner';
import { PerkDetailSheet } from '../../components/PerkDetailSheet';
import { VenueDetailSheet } from '../../components/VenueDetailSheet';
import { VenueCard } from '../../components/VenueCard';
import { triggerHaptic } from '../../lib/haptics';
import { useSavedStateQuery, useTripsQuery } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function TripsScreen() {
  const venueDetailRef = useRef<BottomSheetModal>(null);
  const perkDetailRef = useRef<BottomSheetModal>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const { data, error, isLoading, isRefetching, refetch } = useTripsQuery();
  const savedStateQuery = useSavedStateQuery();
  const { showToast } = useToast();
  const theme = useTheme();
  const scenario = useScenarioStore((state) => state.scenario);
  const setPayMerchant = useScenarioStore((state) => state.setPayMerchant);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);
  const toggleVenueSaved = useScenarioStore((state) => state.toggleVenueSaved);
  const togglePerkSaved = useScenarioStore((state) => state.togglePerkSaved);
  const toggleTripSaved = useScenarioStore((state) => state.toggleTripSaved);
  const savedState = savedStateQuery.data ?? { perkIds: [], tripIds: [], venueIds: [] };
  const savedVenue = data?.savedPlaces.find((venue) => savedState.venueIds.includes(venue.id)) ?? null;
  const savedPerk = data?.cityPerks.find((perk) => savedState.perkIds.includes(perk.id)) ?? null;

  const trustTone =
    data?.user.memberState === 'guest'
      ? 'guest'
      : scenario === 'verificationPending'
        ? 'verification_pending'
        : data?.user.memberState === 'member_preview'
          ? 'member_preview'
          : null;

  const handleOpenVenueDetail = (venue: Venue) => {
    if (!data) {
      return;
    }

    void triggerHaptic('soft');
    setSelectedVenue(venue);
    setSelectedPerk(data.cityPerks.find((perk) => perk.id === venue.featuredPerkId) ?? null);
    venueDetailRef.current?.present();
  };

  const handlePaySelectedVenue = () => {
    void triggerHaptic('soft');
    if (selectedVenue) {
      setPayMerchant(selectedVenue.id);
      setPayAmountText(String(selectedVenue.recommendedSpend.amount));
    }
    perkDetailRef.current?.dismiss();
    venueDetailRef.current?.dismiss();
    router.push(selectedVenue ? '/pay/confirm' : '/pay');
  };

  const handleOpenPerkDetail = (perk: Perk) => {
    if (!data) {
      return;
    }

    void triggerHaptic('soft');
    const associatedVenue = data.savedPlaces.find((venue) => venue.featuredPerkId === perk.id) ?? null;
    setSelectedPerk(perk);
    setSelectedVenue(associatedVenue);
    perkDetailRef.current?.present();
  };

  if (isLoading) {
    return (
      <Screen ornament="trips">
        <View style={styles.header}>
          <Skeleton height={18} width={90} />
          <Skeleton height={44} radius={24} style={{ marginTop: 18 }} width="70%" />
          <Skeleton height={18} style={{ marginTop: 10 }} width="86%" />
        </View>
        <Skeleton height={260} />
        <Skeleton height={180} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="trips">
        <EmptyState
          actionLabel="Try again"
          description="The trip context didn’t load. Refresh and the corridor pulse should settle back in."
          icon={<Compass color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t load trips"
        />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={() => refetch()} ornament="trips" refreshing={isRefetching}>
      <Reveal style={styles.header}>
        <Text color="muted" variant="caption">
          Trips
        </Text>
        <Text style={styles.title} variant="display">
          Keep the corridor close before you land.
        </Text>
        <Text color="muted" style={styles.copy}>
          The route matters most in the days before arrival. Save the run, keep a few places ready, and let the city stay useful without becoming noisy.
        </Text>
      </Reveal>

      {trustTone ? (
        <Reveal delay={50}>
          <TrustBanner tone={trustTone} />
        </Reveal>
      ) : null}

      <Reveal delay={100} style={styles.section}>
        <SectionHeader
          eyebrow="Next up"
          subtitle="Trip context should feel like a private briefing, not a booking funnel."
          title={data.nextTrip ? `${data.nextTrip.city} is next` : 'No trip saved yet'}
        />
        {data.nextTrip ? (
          <TripMomentCard
            moment={data.nextTrip}
            saved={savedState.tripIds.includes(data.nextTrip.id)}
            onSave={() => {
              void triggerHaptic('soft');
              const nextTripId = data.nextTrip?.id;

              if (!nextTripId) {
                return;
              }

              const isSaved = savedState.tripIds.includes(nextTripId);
              toggleTripSaved(nextTripId);
              showToast({
                title: isSaved ? 'Run removed' : 'Route kept close',
                description: isSaved
                  ? `${data.corridor.label} no longer stays pinned for this run.`
                  : `${data.corridor.label} stays pinned for this run in the prototype.`,
                tone: 'success',
              });
            }}
          />
        ) : (
          <EmptyState
            actionLabel="Keep corridor in view"
            description="Once a run is saved, this screen should tighten around one city, one window, and a few relevant places."
            onActionPress={() =>
              showToast({
                title: 'Trip save preview',
                description: 'Trip saving is intentionally lightweight in this slice.',
              })
            }
            title="No trip saved yet"
          />
        )}
      </Reveal>

      {data.travelSignal ? (
        <Reveal delay={150} style={styles.section}>
          <SectionHeader
            eyebrow="Route pulse"
            subtitle="Useful timing context belongs here only when it sharpens the corridor."
            title={data.travelSignal.routeLabel}
          />
          <TravelSignalCard signal={data.travelSignal} />
        </Reveal>
      ) : null}

      <Reveal delay={200} style={styles.section}>
        <SectionHeader
          actionLabel={savedVenue ? 'Open saved place' : data.savedPlaces.length ? 'Pay a partner' : undefined}
          eyebrow="Saved for this city"
          onActionPress={() => {
            if (savedVenue) {
              handleOpenVenueDetail(savedVenue);
              return;
            }

            router.push('/pay');
          }}
          subtitle="Only the places that matter on repeat trips should survive here."
          title="Ready on arrival"
        />
        {data.savedPlaces.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.venueRail}>
                {data.savedPlaces.map((venue) => (
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
            description="Saved places should stay sparse and corridor-specific, not turn into a travel marketplace."
            title="No saved places yet"
          />
        )}
      </Reveal>

      <Reveal delay={260} style={styles.section}>
        <SectionHeader
          actionLabel={savedPerk ? 'Open saved perk' : undefined}
          eyebrow="City benefits"
          onActionPress={savedPerk ? () => handleOpenPerkDetail(savedPerk) : undefined}
          subtitle="Perks should feel like treatment in a city, not points mechanics."
          title="Useful this run"
        />
        {data.cityPerks.length ? (
          <Card variant="default">
            <View style={styles.perkList}>
              {data.cityPerks.map((perk, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={perk.id}
                  onPress={() => handleOpenPerkDetail(perk)}
                  style={[
                    styles.perkRow,
                    index < data.cityPerks.length - 1 ? { borderBottomColor: theme.colors.softLine, borderBottomWidth: StyleSheet.hairlineWidth } : null,
                  ]}>
                  <View style={styles.perkCopy}>
                    <View style={styles.perkHeader}>
                      <Text variant="label">{perk.title}</Text>
                      <View style={styles.perkBadges}>
                        <Badge label={perk.label} tone="brass" />
                        {savedState.perkIds.includes(perk.id) ? <Badge label="Saved" tone="forest" /> : null}
                      </View>
                    </View>
                    <Text color="muted" style={styles.perkDescription}>
                      {perk.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : (
          <EmptyState
            description="City benefits appear only when the corridor has something genuinely worth using on this trip."
            icon={<Sparkles color={theme.colors.brass} size={20} strokeWidth={1.8} />}
            title="No active city benefits"
          />
        )}
      </Reveal>
      <PerkDetailSheet
        onPrimaryAction={handlePaySelectedVenue}
        onToggleSaved={() => {
          if (!selectedPerk) {
            return;
          }

          const isSaved = savedState.perkIds.includes(selectedPerk.id);
          togglePerkSaved(selectedPerk.id);
          showToast({
            title: isSaved ? 'Perk removed' : 'Perk kept close',
            description: isSaved
              ? `${selectedPerk.title} is no longer pinned for this run.`
              : `${selectedPerk.title} now stays visible across the corridor.`,
            tone: 'success',
          });
        }}
        perk={selectedPerk}
        ref={perkDetailRef}
        saved={selectedPerk ? savedState.perkIds.includes(selectedPerk.id) : false}
        venue={selectedVenue}
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
    </Screen>
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
    maxWidth: 330,
  },
  section: {
    marginTop: 24,
  },
  venueRail: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 20,
  },
  perkList: {
    gap: 4,
  },
  perkRow: {
    paddingVertical: 12,
  },
  perkCopy: {
    gap: 6,
  },
  perkHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  perkBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  perkDescription: {
    maxWidth: 300,
  },
});
