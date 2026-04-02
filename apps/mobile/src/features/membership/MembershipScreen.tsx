import type { Perk, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { ChevronLeft, Compass, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MembershipStatusCard } from '../../components/MembershipStatusCard';
import { PerkDetailSheet } from '../../components/PerkDetailSheet';
import { TravelSignalCard } from '../../components/TravelSignalCard';
import { VenueDetailSheet } from '../../components/VenueDetailSheet';
import { VenueCard } from '../../components/VenueCard';
import { triggerHaptic } from '../../lib/haptics';
import { useProfileQuery, useRunReminderQuery, useSavedStateQuery, useTripsQuery } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function MembershipScreen() {
  const venueDetailRef = useRef<BottomSheetModal>(null);
  const perkDetailRef = useRef<BottomSheetModal>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const profileQuery = useProfileQuery();
  const tripsQuery = useTripsQuery();
  const savedStateQuery = useSavedStateQuery();
  const runReminderQuery = useRunReminderQuery();
  const theme = useTheme();
  const { showToast } = useToast();
  const setPayMerchant = useScenarioStore((state) => state.setPayMerchant);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);
  const setRunReminder = useScenarioStore((state) => state.setRunReminder);
  const toggleVenueSaved = useScenarioStore((state) => state.toggleVenueSaved);
  const togglePerkSaved = useScenarioStore((state) => state.togglePerkSaved);
  const savedState = savedStateQuery.data ?? { perkIds: [], tripIds: [], venueIds: [] };
  const runReminder = runReminderQuery.data;

  const isLoading = profileQuery.isLoading || tripsQuery.isLoading;
  const isRefetching = profileQuery.isRefetching || tripsQuery.isRefetching;
  const error = profileQuery.error || tripsQuery.error;
  const profile = profileQuery.data;
  const trips = tripsQuery.data;
  const savedVenue = trips?.savedPlaces.find((venue) => savedState.venueIds.includes(venue.id)) ?? null;
  const savedPerk = trips?.cityPerks.find((perk) => savedState.perkIds.includes(perk.id)) ?? null;

  const handleRefresh = () => {
    void profileQuery.refetch();
    void tripsQuery.refetch();
  };

  const handleOpenVenueDetail = (venue: Venue) => {
    if (!trips) {
      return;
    }

    void triggerHaptic('soft');
    setSelectedVenue(venue);
    setSelectedPerk(trips.cityPerks.find((perk) => perk.id === venue.featuredPerkId) ?? null);
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

  const handleSetReminder = () => {
    if (!selectedVenue && !selectedPerk) {
      return;
    }

    void triggerHaptic('soft');
    setRunReminder({
      id: `reminder_${selectedVenue?.id ?? selectedPerk?.id ?? 'corridor'}`,
      city: profile?.user.currentCity ?? 'Dubai',
      perkId: selectedPerk?.id ?? null,
      setAt: new Date().toISOString(),
      venueId: selectedVenue?.id ?? null,
    });
    perkDetailRef.current?.dismiss();
    venueDetailRef.current?.dismiss();
    showToast({
      title: 'Tonight is ready',
      description: `${selectedVenue?.name ?? selectedPerk?.title ?? 'This corridor move'} now stays pinned back on Home for this run.`,
      tone: 'success',
    });
  };

  const handleOpenPerkDetail = (perk: Perk) => {
    if (!trips) {
      return;
    }

    void triggerHaptic('soft');
    const associatedVenue = trips.savedPlaces.find((venue) => venue.featuredPerkId === perk.id) ?? null;
    setSelectedPerk(perk);
    setSelectedVenue(associatedVenue);
    perkDetailRef.current?.present();
  };

  if (isLoading) {
    return (
      <Screen ornament="home">
        <View style={styles.header}>
          <Skeleton height={18} width={98} />
          <Skeleton height={44} radius={24} style={{ marginTop: 18 }} width="74%" />
          <Skeleton height={18} style={{ marginTop: 10 }} width="84%" />
        </View>
        <Skeleton height={220} />
        <Skeleton height={180} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !profile || !trips) {
    return (
      <Screen ornament="home">
        <EmptyState
          actionLabel="Try again"
          description="The membership destination did not settle. Refresh and the corridor benefits should come back into view."
          icon={<Compass color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={handleRefresh}
          title="Couldn’t load membership"
        />
      </Screen>
    );
  }

  const primaryLabel =
    profile.user.memberState === 'guest'
      ? 'Join the network'
      : profile.verificationState === 'verified'
        ? 'Pay a partner'
        : profile.verificationState === 'in_review'
          ? 'Verification in review'
          : 'Verify to unlock spend';

  const handlePrimaryAction = () => {
    void triggerHaptic('soft');

    if (profile.user.memberState === 'guest') {
      router.push('/profile');
      return;
    }

    if (profile.verificationState === 'verified') {
      router.push('/pay');
      return;
    }

    router.push('/profile');
  };

  return (
    <>
      <Screen onRefresh={handleRefresh} ornament="home" refreshing={isRefetching}>
        <Reveal style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backRow}>
            <ChevronLeft color={theme.colors.mutedText} size={16} strokeWidth={2} />
            <Text color="muted" variant="caption">
              Back
            </Text>
          </Pressable>
          <Text color="muted" variant="caption">
            Membership
          </Text>
          <Text style={styles.title} variant="display">
            Stay inside the corridor between trips.
          </Text>
          <Text color="muted" style={styles.copy}>
            This is where status, treatment, and city access come together before the wallet ever needs to explain itself.
          </Text>
        </Reveal>

        <Reveal delay={60}>
          <MembershipStatusCard profile={profile.memberProfile} />
        </Reveal>

        <Reveal delay={110} style={styles.primaryActionBlock}>
          <Button
            disabled={profile.verificationState === 'in_review'}
            label={primaryLabel}
            onPress={handlePrimaryAction}
            variant={profile.verificationState === 'verified' ? 'primary' : 'secondary'}
          />
        </Reveal>

        <Reveal delay={160} style={styles.section}>
          <SectionHeader
            actionLabel={savedPerk ? 'Open saved perk' : undefined}
            eyebrow="Useful now"
            onActionPress={savedPerk ? () => handleOpenPerkDetail(savedPerk) : undefined}
            subtitle="Benefits should read like treatment in a city, not a rewards program."
            title={`Useful in ${profile.user.currentCity}`}
          />
          {trips.cityPerks.length ? (
            <Card variant="default">
              <View style={styles.perkList}>
                {trips.cityPerks.map((perk, index) => (
                  <Pressable
                    accessibilityRole="button"
                    key={perk.id}
                    onPress={() => handleOpenPerkDetail(perk)}
                    style={[
                      styles.perkRow,
                      index < trips.cityPerks.length - 1
                        ? { borderBottomColor: theme.colors.softLine, borderBottomWidth: StyleSheet.hairlineWidth }
                        : null,
                    ]}>
                    <View style={styles.perkCopy}>
                      <View style={styles.perkHeader}>
                        <Text variant="label">{perk.title}</Text>
                        <View style={styles.perkBadges}>
                          <Badge label={perk.label} tone="brass" />
                          <Badge label={perk.city} tone="forest" />
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
              description="Benefits appear only when the city has something genuinely worth using this run."
              icon={<Sparkles color={theme.colors.brass} size={20} strokeWidth={1.8} />}
              title="No active city benefits"
            />
          )}
        </Reveal>

        <Reveal delay={220} style={styles.section}>
          <SectionHeader
            actionLabel={savedVenue ? 'Open saved place' : 'Pay a partner'}
            eyebrow="Partner venues"
            onActionPress={() => {
              if (savedVenue) {
                handleOpenVenueDetail(savedVenue);
                return;
              }

              router.push('/pay');
            }}
            subtitle="The network should feel curated enough that a few places carry the trip."
            title="Places that still matter"
          />
          {trips.savedPlaces.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.venueRail}>
                {trips.savedPlaces.map((venue) => (
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
              description="As the corridor deepens, this should stay short and recognizable."
              title="No partner venues yet"
            />
          )}
        </Reveal>

        {trips.travelSignal ? (
          <Reveal delay={280} style={styles.section}>
            <SectionHeader
              eyebrow="Corridor pulse"
              subtitle="Travel timing belongs here only when it sharpens the membership ritual."
              title={trips.travelSignal.routeLabel}
            />
            <TravelSignalCard signal={trips.travelSignal} />
          </Reveal>
        ) : null}
      </Screen>

      <PerkDetailSheet
        onPrimaryAction={handlePaySelectedVenue}
        onSetReminder={handleSetReminder}
        onToggleSaved={() => {
          if (!selectedPerk) {
            return;
          }

          togglePerkSaved(selectedPerk.id);
        }}
        perk={selectedPerk}
        ref={perkDetailRef}
        reminderSet={selectedPerk ? runReminder?.perkId === selectedPerk.id : false}
        saved={selectedPerk ? savedState.perkIds.includes(selectedPerk.id) : false}
        venue={selectedVenue}
      />
      <VenueDetailSheet
        onPrimaryAction={handlePaySelectedVenue}
        onSetReminder={handleSetReminder}
        onToggleSaved={() => {
          if (!selectedVenue) {
            return;
          }

          toggleVenueSaved(selectedVenue.id);
        }}
        perk={selectedPerk}
        ref={venueDetailRef}
        reminderSet={selectedVenue ? runReminder?.venueId === selectedVenue.id : false}
        saved={selectedVenue ? savedState.venueIds.includes(selectedVenue.id) : false}
        venue={selectedVenue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  backRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  title: {
    marginTop: 14,
    maxWidth: 320,
  },
  copy: {
    marginTop: 12,
    maxWidth: 332,
  },
  primaryActionBlock: {
    marginTop: 18,
  },
  section: {
    marginTop: 26,
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  perkBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  perkDescription: {
    maxWidth: 300,
  },
  venueRail: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 20,
  },
});
