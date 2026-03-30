import type { Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ChevronRight, QrCode, ScanLine, Store } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MerchantPickerSheet } from '../../components/MerchantPickerSheet';
import { PartnerSpotlightCard } from '../../components/PartnerSpotlightCard';
import { TrustBanner } from '../../components/TrustBanner';
import { formatMoney } from '../../lib/format';
import { triggerHaptic } from '../../lib/haptics';
import { usePayEntryQuery } from '../../lib/queries';
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

export function PayEntryScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerOpen, setScannerOpen] = useState(false);
  const merchantPickerRef = useRef<BottomSheetModal>(null);
  const { data, error, isLoading, isRefetching, refetch } = usePayEntryQuery();
  const { showToast } = useToast();
  const scenario = useScenarioStore((state) => state.scenario);
  const setPayAmountText = useScenarioStore((state) => state.setPayAmountText);
  const setPayMerchant = useScenarioStore((state) => state.setPayMerchant);
  const setReceipt = useScenarioStore((state) => state.setReceipt);
  const theme = useTheme();
  const featuredMerchant = data?.merchants[0] ?? null;
  const partnerPreview = data?.merchants.slice(1, 4) ?? [];
  const featuredPerk = useMemo(
    () =>
      featuredMerchant
        ? data?.eligiblePerks.find((perk) => perk.id === featuredMerchant.featuredPerkId) ?? data?.eligiblePerks[0] ?? null
        : null,
    [data?.eligiblePerks, featuredMerchant],
  );
  const trustTone =
    data?.user.memberState === 'guest'
      ? 'guest'
      : scenario === 'verificationPending'
        ? 'verification_pending'
        : data?.user.memberState === 'member_preview'
          ? 'member_preview'
          : null;

  useEffect(() => {
    setReceipt(null);
  }, [setReceipt]);

  const handleSelectMerchant = (merchant: Venue) => {
    setPayMerchant(merchant.id);
    setPayAmountText(String(merchant.recommendedSpend.amount));
    router.push('/pay/confirm');
  };

  const handleOpenScanner = async () => {
    void triggerHaptic('soft');

    if (!data?.cameraReady) {
      showToast({
        title: 'Scanner not active here',
        description: 'Choose a partner venue directly and keep moving.',
      });
      return;
    }

    if (permission?.granted) {
      setScannerOpen(true);
      return;
    }

    const result = await requestPermission().catch(() => ({ granted: false }));

    if (result.granted) {
      setScannerOpen(true);
      return;
    }

    showToast({
      title: 'Camera unavailable',
      description: 'Partner selection stays available even when scanning is off.',
    });
  };

  if (isLoading) {
    return (
      <Screen ornament="pay">
        <Skeleton height={22} width={120} />
        <Skeleton height={248} style={{ marginTop: 18 }} />
        <Skeleton height={124} style={{ marginTop: 20 }} />
        <Skeleton height={200} style={{ marginTop: 20 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="pay">
        <EmptyState
          actionLabel="Try again"
          description="The pay surface didn’t settle. Refresh and the venue flow should come back."
          icon={<QrCode color={theme.colors.brass} size={24} strokeWidth={1.9} />}
          onActionPress={() => refetch()}
          title="Couldn’t open pay"
        />
      </Screen>
    );
  }

  return (
    <>
      <Screen onRefresh={() => refetch()} ornament="pay" refreshing={isRefetching}>
        <Reveal style={styles.header}>
          <Text color="muted" variant="caption">
            Pay
          </Text>
          <Text style={styles.title} variant="display">
            Choose the partner you’re paying.
          </Text>
          <Text color="muted" style={styles.copy}>
            Start with the venue. Scanning is only a shortcut once the table already has a corridor code on it.
          </Text>
        </Reveal>

        <Reveal delay={50} style={styles.balanceRow}>
          <Badge label={`Available ${formatMoney(data.balance.available)}`} tone="forest" />
          {data.eligiblePerks[0] ? <Badge label={data.eligiblePerks[0].label} tone="brass" /> : null}
        </Reveal>

        {trustTone ? (
          <Reveal delay={90}>
            <TrustBanner tone={trustTone} />
          </Reveal>
        ) : null}

        <Reveal delay={130}>
          <SectionHeader
            eyebrow="Choose partner"
            subtitle="Lead with the venue, then let payment follow cleanly."
            title="Start with the venue"
          />
          {featuredMerchant ? (
            <PartnerSpotlightCard onPress={() => handleSelectMerchant(featuredMerchant)} perk={featuredPerk} venue={featuredMerchant} />
          ) : (
            <EmptyState
              description="Partner pay only works when the corridor has a live venue context."
              title="No featured partner right now"
            />
          )}
        </Reveal>

        <Reveal delay={190} style={styles.section}>
          <SectionHeader
            actionLabel="See all"
            eyebrow="Also nearby"
            onActionPress={() => merchantPickerRef.current?.present()}
            subtitle="A shorter list keeps the network feeling curated."
            title="Other partner venues"
          />
          {partnerPreview.length ? (
            partnerPreview.map((merchant) => (
              <Pressable
                key={merchant.id}
                onPress={() => handleSelectMerchant(merchant)}
                style={[styles.partnerRow, { borderBottomColor: theme.colors.softLine }]}>
                <View style={[styles.partnerIcon, { backgroundColor: theme.colors.elevated }]}>
                  <Store color={theme.colors.primaryText} size={16} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{merchant.name}</Text>
                  <Text color="muted" style={styles.partnerDetail}>
                    {merchant.district} · {merchant.priceNote}
                  </Text>
                  <View style={styles.partnerMeta}>
                    <Badge label={merchant.distance} tone="neutral" />
                    {merchant.featuredPerkId ? <Badge label="Perk live" tone="brass" /> : null}
                  </View>
                </View>
                <View style={styles.partnerTrailing}>
                  <Text variant="label">{formatMoney(merchant.recommendedSpend)}</Text>
                  <View style={styles.partnerAction}>
                    <Text color="muted" variant="caption">
                      Open
                    </Text>
                    <ChevronRight color={theme.colors.mutedText} size={14} strokeWidth={2.1} />
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyState
              description="The corridor stays stronger when only a few relevant venues show up here."
              title="No other partners nearby"
            />
          )}
        </Reveal>

        <Reveal delay={240} style={styles.section}>
          <SectionHeader
            eyebrow="Already there?"
            subtitle="Use the scanner only when the venue already has a corridor code on the table or bill."
            title="Scan a partner code"
          />
          <Card style={styles.scanCard} variant="default">
            {scannerOpen && permission?.granted && data.cameraReady ? (
              <View style={[styles.cameraShell, { borderColor: theme.colors.softLine }]}>
                <CameraView facing="back" style={styles.camera}>
                  <View style={styles.scanOverlay}>
                    <View style={styles.scanFrame} />
                    <Text color="sheet" variant="label">
                      Point at a partner code
                    </Text>
                  </View>
                </CameraView>
              </View>
            ) : (
              <View style={styles.scanIntro}>
                <View style={[styles.scanIconWrap, { backgroundColor: theme.colors.elevated }]}>
                  <ScanLine color={theme.colors.brass} size={20} strokeWidth={1.9} />
                </View>
                <View style={styles.scanCopy}>
                  <Text variant="label">Open scanner only at the venue</Text>
                  <Text color="muted">
                    Partner selection is the default. Scanning only helps when the corridor code is already in front of you.
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.scanActions}>
              <Button label={scannerOpen ? 'Hide scanner' : 'Open scanner'} onPress={scannerOpen ? () => setScannerOpen(false) : handleOpenScanner} />
              <Button label="Choose from full list" onPress={() => merchantPickerRef.current?.present()} variant="secondary" />
            </View>
          </Card>
        </Reveal>
      </Screen>

      <MerchantPickerSheet merchants={data.merchants} onSelect={handleSelectMerchant} ref={merchantPickerRef} />
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
    maxWidth: 330,
  },
  balanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  scanCard: {
    gap: 16,
  },
  cameraShell: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 228,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    minHeight: 228,
  },
  scanOverlay: {
    backgroundColor: 'rgba(16, 12, 10, 0.26)',
    flex: 1,
    justifyContent: 'space-between',
    padding: 22,
  },
  scanFrame: {
    alignSelf: 'center',
    borderColor: '#F8F4ED',
    borderRadius: 26,
    borderWidth: 1.5,
    height: 132,
    marginTop: 24,
    width: 132,
  },
  scanIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  scanIconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  scanCopy: {
    flex: 1,
    gap: 6,
  },
  scanActions: {
    gap: 10,
  },
  section: {
    marginTop: 26,
  },
  partnerRow: {
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  partnerIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  partnerDetail: {
    marginTop: 4,
  },
  partnerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  partnerTrailing: {
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 2,
  },
  partnerAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
});
