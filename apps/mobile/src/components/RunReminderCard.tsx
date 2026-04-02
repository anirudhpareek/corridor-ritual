import type { Perk, Venue } from '@corridor/domain';
import { BellRing, MapPinned, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  city: string;
  onClear: () => void;
  onPrimaryAction: () => void;
  perk: Perk | null;
  venue: Venue | null;
};

export function RunReminderCard({ city, onClear, onPrimaryAction, perk, venue }: Props) {
  const theme = useTheme();

  const title = venue ? `${venue.name} stays first tonight.` : perk ? `${perk.title} stays ready tonight.` : `Keep ${city} ready tonight.`;
  const description = venue
    ? perk
      ? `${perk.title} will settle quietly when you pay ${venue.name}, so the first table is already decided.`
      : `${venue.name} stays pinned back on Home so the next landing starts with one reliable place instead of another search.`
    : perk
      ? `${perk.title} stays pinned back on Home so the city keeps one quiet member benefit in view.`
      : `A single saved move should be enough to make tonight feel calmer.`;
  const primaryLabel = venue ? 'Pay this partner' : perk ? 'Open saved perk' : 'Open trip';

  return (
    <Card variant="hero">
      <View style={styles.topRow}>
        <View style={styles.titleCopy}>
          <Text color="muted" variant="caption">
            Ready tonight
          </Text>
          <Text style={styles.title} variant="section">
            {title}
          </Text>
        </View>
        <Badge label={perk ? 'Perk attached' : 'Partner ready'} tone={perk ? 'brass' : 'forest'} />
      </View>

      <Text color="muted" style={styles.description}>
        {description}
      </Text>

      <View style={styles.metaRow}>
        {venue ? (
          <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
            <MapPinned color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">{venue.district}</Text>
              <Text color="muted" variant="caption">
                {venue.distance}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
          {perk ? <Sparkles color={theme.colors.forest} size={16} strokeWidth={1.8} /> : <BellRing color={theme.colors.forest} size={16} strokeWidth={1.8} />}
          <View style={styles.metaCopy}>
            <Text variant="label">{perk ? perk.label : venue ? formatMoney(venue.recommendedSpend) : city}</Text>
            <Text color="muted" variant="caption">
              {perk ? 'Quiet value' : venue ? 'Usual spend' : 'Corridor focus'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={onPrimaryAction} />
        <Button label="Clear" onPress={onClear} variant="ghost" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    marginTop: 6,
  },
  description: {
    marginTop: 12,
    maxWidth: 300,
  },
  metaCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  metaCopy: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    gap: 10,
    marginTop: 18,
  },
  title: {
    marginTop: 6,
    maxWidth: 260,
  },
  titleCopy: {
    flex: 1,
    paddingRight: 12,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
