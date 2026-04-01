import type { Perk, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Compass, MapPinned, Sparkles } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { formatMoney } from '../lib/format';
import { getVenueTonePalette } from '../lib/venueTone';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  onPrimaryAction: () => void;
  onToggleSaved?: () => void;
  perk: Perk | null;
  saved?: boolean;
  venue: Venue | null;
};

function corridorNoteForVenue(venue: Venue) {
  if (venue.category === 'Dinner') {
    return 'Best when the city day is almost over and the corridor needs one reliable table to reset around.';
  }

  if (venue.category === 'Coffee') {
    return 'Best for the first meeting window after landing, when the trip still needs a soft start instead of a long plan.';
  }

  if (venue.category === 'Recovery') {
    return 'Best once the corridor catches up with your body and the city starts asking for more than arrival energy.';
  }

  return 'Best when the corridor needs one calm, repeatable place instead of another search result.';
}

export const VenueDetailSheet = forwardRef<BottomSheetModal, Props>(function VenueDetailSheet(
  { onPrimaryAction, onToggleSaved, perk, saved = false, venue },
  ref,
) {
  const theme = useTheme();

  if (!venue) {
    return null;
  }

  const tone = getVenueTonePalette(venue.imageTone, theme);

  return (
    <Sheet
      ref={ref}
      snapPoints={['72%']}
      subtitle="A short venue brief keeps discovery curated. If the place matters, the next step should be obvious."
      title="Partner venue">
      <View style={styles.content}>
        <LinearGradient
          colors={[theme.colors.sheet, tone.soft]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[styles.hero, theme.shadow.soft]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {venue.category} · {venue.distance}
              </Text>
              <Text style={styles.heroTitle} variant="display">
                {venue.name}
              </Text>
            </View>
            <Badge label={perk ? 'Perk live' : 'Partner venue'} tone={perk ? 'brass' : 'neutral'} />
          </View>
          <Text color="muted" style={styles.heroDetail}>
            {venue.vibe}
          </Text>
        </LinearGradient>

        <View style={styles.metaRow}>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <MapPinned color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">{venue.district}</Text>
              <Text color="muted" variant="caption">
                City anchor
              </Text>
            </View>
          </View>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <Compass color={theme.colors.forest} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">{formatMoney(venue.recommendedSpend)}</Text>
              <Text color="muted" variant="caption">
                Usual spend
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            Why it stays in the corridor
          </Text>
          <Text style={styles.noteCopy}>{corridorNoteForVenue(venue)}</Text>
        </View>

        <View style={[styles.noteBlock, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            Tonight’s context
          </Text>
          <Text style={styles.noteCopy}>{venue.priceNote}</Text>
        </View>

        {perk ? (
          <View style={[styles.perkBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <View style={styles.perkHeader}>
              <View style={styles.perkHeaderCopy}>
                <Text color="muted" variant="caption">
                  Member perk
                </Text>
                <Text variant="label">{perk.title}</Text>
              </View>
              <Badge label={perk.label} tone="brass" />
            </View>
            <Text color="muted" style={styles.perkDescription}>
              {perk.description}
            </Text>
          </View>
        ) : (
          <View style={[styles.perkBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
            <View style={styles.perkFallbackRow}>
              <Sparkles color={theme.colors.brass} size={16} strokeWidth={1.8} />
              <View style={styles.perkHeaderCopy}>
                <Text variant="label">Partner access stays simple</Text>
                <Text color="muted" style={styles.perkDescription}>
                  This venue is inside the network even without a live perk on this run.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button label="Pay this partner" onPress={onPrimaryAction} />
          {onToggleSaved ? (
            <Button label={saved ? 'Saved for this run' : 'Save for this run'} onPress={onToggleSaved} variant="secondary" />
          ) : null}
        </View>
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  hero: {
    borderRadius: 24,
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    marginTop: 8,
    maxWidth: 260,
  },
  heroDetail: {
    maxWidth: 290,
  },
  metaRow: {
    gap: 10,
  },
  metaCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  noteBlock: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteCopy: {
    maxWidth: 300,
  },
  perkBlock: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  perkHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  perkHeaderCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  perkDescription: {
    maxWidth: 300,
  },
  perkFallbackRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  actions: {
    gap: 10,
  },
});
