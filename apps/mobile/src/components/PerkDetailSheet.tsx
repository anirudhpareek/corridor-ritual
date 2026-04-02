import type { Perk, Venue } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Gift, MapPinned, Sparkles } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  perk: Perk | null;
  onSetReminder?: () => void;
  onToggleSaved?: () => void;
  reminderSet?: boolean;
  venue: Venue | null;
  onPrimaryAction: () => void;
  saved?: boolean;
};

export const PerkDetailSheet = forwardRef<BottomSheetModal, Props>(function PerkDetailSheet(
  { onPrimaryAction, onSetReminder, onToggleSaved, perk, reminderSet = false, saved = false, venue },
  ref,
) {
  const theme = useTheme();

  if (!perk) {
    return null;
  }

  return (
    <Sheet
      ref={ref}
      snapPoints={['66%']}
      subtitle="Perks should feel like quiet treatment in a city, with one clear place to use them."
      title="Member perk">
      <View style={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {perk.city}
              </Text>
              <Text style={styles.title} variant="display">
                {perk.title}
              </Text>
            </View>
            <Badge label={perk.label} tone="brass" />
          </View>
          <Text color="muted" style={styles.description}>
            {perk.description}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
            <Gift color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">{formatMoney(perk.savings)}</Text>
              <Text color="muted" variant="caption">
                Quiet value
              </Text>
            </View>
          </View>
          <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
            <Sparkles color={theme.colors.forest} size={16} strokeWidth={1.8} />
            <View style={styles.metaCopy}>
              <Text variant="label">{perk.category}</Text>
              <Text color="muted" variant="caption">
                Corridor benefit
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.partnerBlock, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <View style={styles.partnerHeader}>
            <MapPinned color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <Text variant="label">{venue ? venue.name : 'Partner venue'}</Text>
          </View>
          <Text color="muted" style={styles.partnerCopy}>
            {venue
              ? `${venue.district} · ${venue.priceNote}. The perk settles quietly when you pay this partner.`
              : 'This perk is held for partner venues already inside the network.'}
          </Text>
        </View>

        {onSetReminder ? (
          <View style={[styles.partnerBlock, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
            <Text color="muted" variant="caption">
              Tonight cue
            </Text>
            <Text color="muted" style={styles.partnerCopy}>
              Keep this perk pinned back on Home so the next arrival still has one quiet member move in view.
            </Text>
            <Button label={reminderSet ? 'Tonight is ready' : 'Set for tonight'} onPress={onSetReminder} variant="quiet" />
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label={venue ? 'Use this perk' : 'Open partners'} onPress={onPrimaryAction} />
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
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginTop: 8,
    maxWidth: 260,
  },
  description: {
    maxWidth: 300,
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
  partnerBlock: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  partnerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  partnerCopy: {
    maxWidth: 300,
  },
  actions: {
    gap: 10,
  },
});
