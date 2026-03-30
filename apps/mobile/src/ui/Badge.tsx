import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

type Tone = 'neutral' | 'brass' | 'forest' | 'success' | 'pending' | 'danger';

type Props = {
  label: string;
  tone?: Tone;
};

export function Badge({ label, tone = 'neutral' }: Props) {
  const theme = useTheme();

  const colors =
    tone === 'brass'
      ? { backgroundColor: theme.colors.brassSoft, borderColor: theme.colors.brass, textColor: theme.colors.brass }
      : tone === 'forest'
        ? { backgroundColor: '#D7E3DC', borderColor: theme.colors.forest, textColor: theme.colors.forest }
        : tone === 'success'
          ? { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.success, textColor: theme.colors.success }
          : tone === 'pending'
            ? { backgroundColor: theme.colors.pendingSoft, borderColor: theme.colors.pending, textColor: theme.colors.pending }
            : tone === 'danger'
              ? { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger, textColor: theme.colors.danger }
              : { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine, textColor: theme.colors.mutedText };

  return (
    <View style={[styles.base, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}>
      <View style={[styles.dot, { backgroundColor: colors.textColor }]} />
      <Text style={{ color: colors.textColor }} variant="caption">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    alignSelf: 'center',
    borderRadius: 999,
    height: 5,
    width: 5,
  },
});
