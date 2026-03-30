import type { Perk, Venue } from '@corridor/domain';
import { ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { getVenueTonePalette } from '../lib/venueTone';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

type Props = {
  onPress: () => void;
  perk: Perk | null;
  venue: Venue;
};

export function PartnerSpotlightCard({ onPress, perk, venue }: Props) {
  const theme = useTheme();
  const tone = getVenueTonePalette(venue.imageTone, theme);

  return (
    <Pressable
      accessibilityHint="Opens this partner venue for payment"
      accessibilityLabel={`${venue.name}, featured partner venue`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <LinearGradient
        colors={[theme.colors.sheet, tone.soft]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.card, theme.shadow.lifted]}>
        <View style={styles.header}>
          <View style={styles.copy}>
            <Text color="muted" variant="caption">
              Featured partner
            </Text>
            <Text style={styles.title} variant="display">
              {venue.name}
            </Text>
          </View>
          <Badge label={perk ? 'Perk live' : venue.category} tone={perk ? 'brass' : 'neutral'} />
        </View>

        <Text color="muted" style={styles.vibe}>
          {venue.vibe}
        </Text>

        <View style={styles.metaRow}>
          <View>
            <Text color="muted" variant="caption">
              District
            </Text>
            <Text variant="label">{venue.district}</Text>
          </View>
          <View>
            <Text color="muted" variant="caption">
              Usual spend
            </Text>
            <Text variant="label">{formatMoney(venue.recommendedSpend)}</Text>
          </View>
        </View>

        <View style={[styles.footer, { borderColor: theme.colors.softLine, backgroundColor: 'rgba(255,255,255,0.54)' }]}>
          <View style={styles.footerCopy}>
            <Text variant="label">{perk ? `${perk.title} · ${perk.label}` : venue.priceNote}</Text>
            <Text color="muted" style={styles.footerDetail}>
              {perk ? perk.description : `${venue.distance} from your current corridor rhythm.`}
            </Text>
          </View>
          <View style={styles.action}>
            <Text color="brass" variant="caption">
              Pay here
            </Text>
            <ArrowRight color={theme.colors.brass} size={16} strokeWidth={1.8} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginTop: 8,
    maxWidth: 280,
  },
  vibe: {
    marginTop: -2,
    maxWidth: 320,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  footerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  footerDetail: {
    marginTop: 6,
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
