import type { Venue } from '@corridor/domain';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { getVenueTonePalette } from '../lib/venueTone';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  venue: Venue;
  onPress?: () => void;
  saved?: boolean;
};

export function VenueCard({ onPress, saved = false, venue }: Props) {
  const theme = useTheme();
  const tone = getVenueTonePalette(venue.imageTone, theme);

  return (
    <Pressable
      accessibilityHint={onPress ? 'Opens this partner venue preview' : undefined}
      accessibilityLabel={`${venue.name}, ${venue.category}, ${venue.district}`}
      accessibilityRole={onPress ? 'button' : 'summary'}
      onPress={onPress}
      style={styles.pressable}>
      <Card style={styles.card} variant="default">
        <View style={[styles.toneBlock, { backgroundColor: tone.solid }]}>
          <View style={styles.toneTopRow}>
            <Text color="sheet" variant="caption">
              Partner venue
            </Text>
            <Text color="sheet" variant="caption">
              {venue.distance}
            </Text>
          </View>
          <Text color="sheet" style={styles.toneTitle} variant="title">
            {venue.priceNote}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Badge label={venue.category} tone={venue.imageTone === 'forest' ? 'forest' : venue.imageTone === 'sand' ? 'brass' : 'neutral'} />
          {venue.featuredPerkId ? <Badge label="Perk live" tone="brass" /> : null}
          {saved ? <Badge label="Saved" tone="forest" /> : null}
        </View>
        <Text style={styles.name} variant="title">
          {venue.name}
        </Text>
        <Text color="muted">{venue.vibe}</Text>
        <View style={styles.bottomRow}>
          <Text color="muted" variant="caption">
            {venue.district}
          </Text>
          <Text variant="label">{formatMoney(venue.recommendedSpend)}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: 280,
  },
  card: {
    gap: 14,
    minHeight: 182,
  },
  toneBlock: {
    borderRadius: 18,
    gap: 8,
    marginBottom: 2,
    marginTop: -2,
    minHeight: 88,
    padding: 16,
  },
  toneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toneTitle: {
    maxWidth: 180,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    marginTop: 6,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});
