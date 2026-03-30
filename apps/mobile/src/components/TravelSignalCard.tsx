import type { TravelSignal } from '@corridor/domain';
import { ArrowUpRight, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  signal: TravelSignal;
};

export function TravelSignalCard({ signal }: Props) {
  const theme = useTheme();

  return (
    <Card variant="default">
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text color="muted" variant="caption">
            Corridor pulse
          </Text>
          <Text style={styles.title} variant="title">
            {signal.routeLabel}
          </Text>
        </View>
        <Badge label={signal.windowLabel} tone="forest" />
      </View>

      <View style={styles.headlineRow}>
        <Sparkles color={theme.colors.brass} size={18} strokeWidth={1.6} />
        <Text variant="section">{signal.headline}</Text>
      </View>

      <Text color="muted" style={styles.detail}>
        {signal.detail}
      </Text>

      <View style={styles.footer}>
        <Text color="brass" variant="label">
          {signal.priceHint}
        </Text>
        <ArrowUpRight color={theme.colors.mutedText} size={16} strokeWidth={1.8} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginTop: 4,
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
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});
