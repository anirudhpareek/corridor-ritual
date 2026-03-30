import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { SlidersHorizontal } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { scenarios } from '@corridor/mocks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScenarioStore } from '../lib/store/useScenarioStore';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

const scenarioMeta: Record<(typeof scenarios)[number], { label: string; description: string }> = {
  guest: {
    label: 'Guest browse',
    description: 'Preview the corridor without funding or live spend enabled.',
  },
  memberPreview: {
    label: 'Member preview',
    description: 'Signed in and inside the network, but not yet verified for live spend.',
  },
  verified: {
    label: 'Verified member',
    description: 'Standard happy path with wallet, pay, and perks available.',
  },
  verificationPending: {
    label: 'Verification pending',
    description: 'Shows manual review and trust gating in-progress.',
  },
  pendingFunds: {
    label: 'Pending funds',
    description: 'Highlights separated available and pending balance states.',
  },
  lowBalance: {
    label: 'Low balance',
    description: 'Useful for testing constrained pay and wallet moments.',
  },
  perkEligible: {
    label: 'Perk eligible',
    description: 'Surfaces venue-linked perks inside the payment flow.',
  },
  paymentSuccess: {
    label: 'Payment success',
    description: 'Optimized for success-state polish and receipt review.',
  },
  paymentFailed: {
    label: 'Payment failed',
    description: 'Exercises retry and trust copy in the payment flow.',
  },
  empty: {
    label: 'Sparse state',
    description: 'For empty rails, empty activity, and low-density surfaces.',
  },
  error: {
    label: 'Error state',
    description: 'For route-level fetch failures and recovery states.',
  },
};

export function DevScenarioToggle() {
  const ref = useRef<BottomSheetModal>(null);
  const scenario = useScenarioStore((state) => state.scenario);
  const setScenario = useScenarioStore((state) => state.setScenario);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!__DEV__) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityLabel="Open preview scenarios"
        accessibilityRole="button"
        onPress={() => ref.current?.present()}
        style={[styles.buttonWrap, { bottom: Math.max(insets.bottom + theme.layout.tabBarHeight + 8, 110) }]}>
        <BlurView intensity={45} style={[styles.button, { borderColor: theme.colors.softLine }, theme.shadow.soft]} tint="light">
          <SlidersHorizontal color={theme.colors.primaryText} size={16} strokeWidth={1.8} />
          <View style={styles.buttonCopy}>
            <Text variant="caption">Preview</Text>
            <Text color="muted" variant="caption">
              {scenarioMeta[scenario].label}
            </Text>
          </View>
        </BlurView>
      </Pressable>

      <Sheet
        ref={ref}
        snapPoints={['68%']}
        subtitle="Use this only while shaping empty, loading, and payment-state variants."
        title="Preview scenarios">
        <View style={styles.list}>
          {scenarios.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setScenario(item);
                ref.current?.dismiss();
              }}
              style={[styles.row, { borderBottomColor: theme.colors.softLine }]}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowLabel} variant="label">
                  {scenarioMeta[item].label}
                </Text>
                <Text color="muted" variant="caption">
                  {scenarioMeta[item].description}
                </Text>
              </View>
              <Badge label={item === scenario ? 'Active' : 'Preview'} tone={item === scenario ? 'brass' : 'neutral'} />
            </Pressable>
          ))}
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    left: 18,
    position: 'absolute',
    zIndex: 40,
  },
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonCopy: {
    gap: 1,
  },
  list: {
    gap: 4,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 12,
  },
  rowLabel: {
    textTransform: 'none',
  },
});
