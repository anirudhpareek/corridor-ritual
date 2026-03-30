import type { TripMoment } from '@corridor/domain';
import { CalendarRange, PlaneTakeoff, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  moment: TripMoment;
  onSave: () => void;
};

export function TripMomentCard({ moment, onSave }: Props) {
  const theme = useTheme();

  return (
    <Card variant="hero">
      <View style={styles.topRow}>
        <View style={styles.cityCopy}>
          <Text color="muted" variant="caption">
            Next city
          </Text>
          <Text style={styles.city} variant="display">
            {moment.city}
          </Text>
        </View>
        <Badge label={moment.windowLabel} tone="forest" />
      </View>

      <View style={styles.headlineRow}>
        <Sparkles color={theme.colors.brass} size={18} strokeWidth={1.8} />
        <Text style={{ flex: 1 }} variant="section">
          {moment.headline}
        </Text>
      </View>

      <Text color="muted" style={styles.detail}>
        {moment.detail}
      </Text>

      <View style={styles.metaRow}>
        <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
          <PlaneTakeoff color={theme.colors.brass} size={16} strokeWidth={1.8} />
          <View style={styles.metaCopy}>
            <Text variant="label">{moment.flightHint}</Text>
            <Text color="muted" variant="caption">
              Corridor timing
            </Text>
          </View>
        </View>
        <View style={[styles.metaCard, { backgroundColor: theme.colors.sheet }]}>
          <CalendarRange color={theme.colors.forest} size={16} strokeWidth={1.8} />
          <View style={styles.metaCopy}>
            <Text variant="label">{moment.savedPlaceCount} saved places</Text>
            <Text color="muted" variant="caption">
              Ready on arrival
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.ritualRow, { borderColor: theme.colors.softLine }]}>
        <Text color="muted" variant="caption">
          Ritual
        </Text>
        <Text style={styles.ritualCopy}>{moment.ritual}</Text>
      </View>

      <Button label="Save this run" onPress={onSave} variant="secondary" />
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityCopy: {
    flex: 1,
    paddingRight: 12,
  },
  city: {
    marginTop: 6,
  },
  headlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  detail: {
    marginTop: 12,
  },
  metaRow: {
    gap: 10,
    marginTop: 18,
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
  ritualRow: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  ritualCopy: {
    maxWidth: 280,
  },
});
