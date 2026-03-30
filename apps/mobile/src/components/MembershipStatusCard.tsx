import type { MemberProfile } from '@corridor/domain';
import { StyleSheet, View } from 'react-native';

import { tierLabel } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';

type Props = {
  profile: MemberProfile;
};

export function MembershipStatusCard({ profile }: Props) {
  const theme = useTheme();

  return (
    <Card variant="hero">
      <View style={[styles.accentLine, { backgroundColor: theme.colors.brass }]} />

      <View style={styles.topRow}>
        <View>
          <Text color="muted" variant="caption">
            Membership
          </Text>
          <Text style={styles.tier} variant="title">
            {tierLabel(profile.tier)}
          </Text>
        </View>
        <Badge label={profile.tier === 'guest' ? 'Preview' : 'In network'} tone={profile.tier === 'guest' ? 'neutral' : 'brass'} />
      </View>

      <Text color="muted" style={styles.statusLine}>
        {profile.statusLine}
      </Text>

      <View style={[styles.progressPanel, { backgroundColor: theme.colors.sheet }]}>
        <View style={styles.progressMeta}>
          <Text color="muted" variant="caption">
            Corridor progress
          </Text>
          <Text color="brass" variant="caption">
            {Math.round(profile.progress * 100)}%
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.colors.brassSoft }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.brass, width: `${Math.max(profile.progress * 100, 10)}%` },
            ]}
          />
        </View>

        <Text color="muted" style={styles.progressCaption} variant="caption">
          Status builds through repeat partner spend, not noise or points churn.
        </Text>
      </View>

      <View style={[styles.nextUnlockCard, { borderColor: theme.colors.softLine, backgroundColor: 'rgba(255,255,255,0.38)' }]}>
        <Text color="muted" variant="caption">
          Next unlock
        </Text>
        <Text color="muted" style={styles.nextUnlock}>
          {profile.nextUnlock}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  accentLine: {
    borderRadius: 999,
    height: 4,
    marginBottom: 18,
    width: 44,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tier: {
    marginTop: 4,
  },
  statusLine: {
    marginTop: 14,
  },
  progressPanel: {
    borderRadius: 20,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  progressCaption: {
    marginTop: 10,
  },
  nextUnlockCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  nextUnlock: {
    marginTop: 6,
  },
});
