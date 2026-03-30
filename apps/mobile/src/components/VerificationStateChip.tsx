import type { VerificationState } from '@corridor/domain';
import { BadgeCheck, ShieldEllipsis, ShieldQuestion } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from '../ui/Text';

type Props = {
  state: VerificationState;
};

export function VerificationStateChip({ state }: Props) {
  const theme = useTheme();
  const tone =
    state === 'verified'
      ? { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.success, textColor: theme.colors.success }
      : state === 'in_review'
        ? { backgroundColor: theme.colors.pendingSoft, borderColor: theme.colors.pending, textColor: theme.colors.pending }
        : { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine, textColor: theme.colors.primaryText };
  const Icon = state === 'verified' ? BadgeCheck : state === 'in_review' ? ShieldEllipsis : ShieldQuestion;
  const label = state === 'verified' ? 'Verified for spend' : state === 'in_review' ? 'Verification in review' : 'Verification not started';

  return (
    <View style={[styles.base, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
      <Icon color={tone.textColor} size={15} strokeWidth={1.9} />
      <Text style={{ color: tone.textColor }} variant="caption">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
