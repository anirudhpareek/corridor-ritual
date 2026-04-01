import type { ActivityItem } from '@corridor/domain';
import { ArrowDownLeft, ArrowUpRight, CircleAlert, Clock3, ReceiptText } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoneySigned, formatRelativeTime, statusLabel } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

type Props = {
  item: ActivityItem;
  onPress?: () => void;
};

export function ActivityRow({ item, onPress }: Props) {
  const theme = useTheme();
  const Icon =
    item.status === 'failed'
      ? CircleAlert
      : item.status === 'pending'
        ? Clock3
        : item.direction === 'credit'
          ? ArrowDownLeft
          : ArrowUpRight;
  const iconColors =
    item.status === 'failed'
      ? { backgroundColor: theme.colors.dangerSoft, foreground: theme.colors.danger }
      : item.status === 'pending'
        ? { backgroundColor: theme.colors.pendingSoft, foreground: theme.colors.pending }
        : item.direction === 'credit'
      ? { backgroundColor: theme.colors.successSoft, foreground: theme.colors.success }
      : { backgroundColor: theme.colors.elevated, foreground: theme.colors.primaryText };
  const Container = onPress ? Pressable : View;

  return (
    <Container
      accessibilityHint={
        onPress ? (item.kind === 'split' && item.relatedSplitId ? 'Opens split summary' : 'Opens receipt detail') : undefined
      }
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: theme.colors.softLine }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconColors.backgroundColor }]}>
        <Icon color={iconColors.foreground} size={16} strokeWidth={1.75} />
      </View>
      <View style={styles.copy}>
        <Text variant="label">{item.title}</Text>
        <Text color="muted" style={styles.subtitle}>
          {item.subtitle} · {formatRelativeTime(item.occurredAt)}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text variant="label">{formatMoneySigned(item.amount, item.direction)}</Text>
        <Badge
          label={statusLabel(item.status)}
          tone={item.status === 'failed' ? 'danger' : item.status === 'pending' ? 'pending' : 'neutral'}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
  },
});
