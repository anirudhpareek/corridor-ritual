import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Clock3, ShieldCheck, Wallet } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useScenarioStore } from '../lib/store/useScenarioStore';
import { useTheme } from '../theme';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  onPendingReview?: () => void;
  onVerified: () => void;
  afterVerified?: () => void;
};

export const VerificationPromptSheet = forwardRef<BottomSheetModal, Props>(function VerificationPromptSheet(
  { afterVerified, onPendingReview, onVerified },
  ref,
) {
  const enableVerifiedSpend = useScenarioStore((state) => state.enableVerifiedSpend);
  const showVerificationReview = useScenarioStore((state) => state.showVerificationReview);
  const theme = useTheme();
  const features = [
    {
      icon: Wallet,
      title: 'Funding turns on',
      detail: 'Add money only when you are ready to use the corridor, not the moment you first browse it.',
    },
    {
      icon: ShieldCheck,
      title: 'Spend stays protected',
      detail: 'Partner checkout stays calm and trustworthy once verification clears.',
    },
  ] as const;

  const dismiss = () => {
    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  return (
    <Sheet
      ref={ref}
      snapPoints={['58%']}
      subtitle="Member preview keeps discovery open. Verification only appears once you are ready to fund and spend."
      title="Verify to unlock spend">
      <View style={styles.content}>
        <View style={styles.heroRow}>
          <ShieldCheck color={theme.colors.brass} size={18} strokeWidth={1.8} />
          <View style={styles.heroCopy}>
            <Text variant="label">What verification changes</Text>
            <Text color="muted">
              Funding and partner checkout switch on, while the underlying rails stay hidden and quiet.
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

        <View style={[styles.reviewHint, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <Clock3 color={theme.colors.pending} size={16} strokeWidth={1.8} />
          <Text color="muted" style={{ flex: 1 }} variant="caption">
            Need to preview the hold state? You can switch this flow into review without leaving the screen.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Enable verified spend demo"
            onPress={() => {
              enableVerifiedSpend();
              onVerified();
              dismiss();
              if (afterVerified) {
                setTimeout(() => afterVerified(), 220);
              }
            }}
          />
          <Button
            label="Show review state"
            onPress={() => {
              showVerificationReview();
              onPendingReview?.();
              dismiss();
            }}
            variant="secondary"
          />
        </View>
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
  reviewHint: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  actions: {
    gap: 10,
  },
});
