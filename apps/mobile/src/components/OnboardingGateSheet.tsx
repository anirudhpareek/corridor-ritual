import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Compass, QrCode, Sparkles, Wallet } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useScenarioStore } from '../lib/store/useScenarioStore';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  onJoined: () => void;
  afterJoin?: () => void;
};

export const OnboardingGateSheet = forwardRef<BottomSheetModal, Props>(function OnboardingGateSheet(
  { afterJoin, onJoined },
  ref,
) {
  const promoteToMember = useScenarioStore((state) => state.promoteToMember);
  const theme = useTheme();
  const features = [
    {
      icon: Wallet,
      title: 'Travel balance',
      detail: 'One calm balance for corridor spend, with pending and available states kept separate.',
    },
    {
      icon: QrCode,
      title: 'Partner checkout',
      detail: 'Spend at member venues without exposing rails, wallets, or any crypto-native UI.',
    },
    {
      icon: Sparkles,
      title: 'Perks that matter',
      detail: 'Arrival dinners, recovery access, and city-native treatment instead of noisy rewards.',
    },
  ] as const;

  return (
    <Sheet
      ref={ref}
      snapPoints={['62%']}
      subtitle="Stay in guest mode as long as you want. We only ask for details when you are ready to fund and spend."
      title="Browse first, join when ready">
      <View style={styles.content}>
        <View style={styles.heroRow}>
          <Compass color={theme.colors.brass} size={18} strokeWidth={1.8} />
          <View style={styles.heroCopy}>
            <Text variant="label">What changes after joining</Text>
            <Text color="muted">
              You enter member preview: corridor context stays open, while funding and partner checkout wait until you verify.
            </Text>
          </View>
        </View>

        <View style={styles.features}>
          {features.map(({ detail, icon: Icon, title }) => (
            <View
              key={title}
              style={[
                styles.featureCard,
                {
                  backgroundColor: theme.colors.elevated,
                  borderColor: theme.colors.softLine,
                },
              ]}>
              <Icon color={theme.colors.brass} size={16} strokeWidth={1.9} />
              <View style={styles.featureCopy}>
                <Text variant="label">{title}</Text>
                <Text color="muted" variant="caption">
                  {detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text color="muted" variant="caption">
          Joining keeps the network close. Spend still waits for a later verification step.
        </Text>

        <Button
          label="Enter member preview"
          onPress={() => {
            promoteToMember();
            onJoined();
            if (ref && 'current' in ref) {
              ref.current?.dismiss();
            }
            if (afterJoin) {
              setTimeout(() => afterJoin(), 220);
            }
          }}
        />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  features: {
    gap: 10,
  },
  featureCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  featureCopy: {
    flex: 1,
    gap: 4,
  },
});
