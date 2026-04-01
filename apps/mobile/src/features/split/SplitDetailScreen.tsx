import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, UsersRound } from 'lucide-react-native';
import { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SplitCard } from '../../components/SplitCard';
import { SplitFollowUpSheet } from '../../components/SplitFollowUpSheet';
import { formatMoney, formatTimestamp } from '../../lib/format';
import { triggerHaptic } from '../../lib/haptics';
import { getSplitAmounts, getSplitCounts } from '../../lib/splits';
import { useSplitRequestQuery } from '../../lib/queries';
import { useScenarioStore } from '../../lib/store/useScenarioStore';
import { useToast } from '../../providers/ToastProvider';
import { useTheme } from '../../theme';
import { Badge } from '../../ui/Badge';
import { BottomActionBar } from '../../ui/BottomActionBar';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { Reveal } from '../../ui/Reveal';
import { Screen } from '../../ui/Screen';
import { SectionHeader } from '../../ui/SectionHeader';
import { Skeleton } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';

export function SplitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const editRef = useRef<BottomSheetModal>(null);
  const { data, error, isLoading, isRefetching, refetch } = useSplitRequestQuery(id);
  const updateSplitParticipants = useScenarioStore((state) => state.updateSplitParticipants);
  const toggleSplitParticipantPaid = useScenarioStore((state) => state.toggleSplitParticipantPaid);
  const { showToast } = useToast();
  const theme = useTheme();

  const canEdit = useMemo(
    () => Boolean(data && data.status === 'pending' && data.participants.every((participant) => participant.status === 'pending')),
    [data],
  );

  if (isLoading) {
    return (
      <Screen ornament="wallet">
        <View style={styles.header}>
          <Skeleton height={18} width={88} />
          <Skeleton height={44} radius={24} style={{ marginTop: 18 }} width="70%" />
          <Skeleton height={18} style={{ marginTop: 10 }} width="80%" />
        </View>
        <Skeleton height={220} />
        <Skeleton height={260} style={{ marginTop: 22 }} />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen ornament="wallet">
        <EmptyState
          actionLabel="Back home"
          description="The split detail did not load. Return to the corridor and reopen it from group activity."
          icon={<UsersRound color={theme.colors.brass} size={22} strokeWidth={1.9} />}
          onActionPress={() => router.replace('/')}
          title="Couldn’t load split"
        />
      </Screen>
    );
  }

  const { paidCount, pendingCount } = getSplitCounts(data);
  const { remainingAmount, settledBackAmount } = getSplitAmounts(data);
  const summaryHeadline =
    data.status === 'settled'
      ? 'Everyone has replied and the table is fully closed.'
      : data.status === 'partially_settled'
        ? `${paidCount} of ${data.participants.length} guests have settled back so far.`
        : 'The original payment is complete. Replies are still coming back from your circle.';
  const summaryDetail =
    data.status === 'settled'
      ? 'The corridor kept the original dinner intact while the social follow-up resolved quietly in the background.'
      : data.status === 'partially_settled'
        ? `${formatMoney({
            ...data.requestedBack,
            amount: settledBackAmount,
          })} has returned and ${formatMoney({
            ...data.requestedBack,
            amount: remainingAmount,
          })} is still pending.`
        : `${formatMoney(data.requestedBack)} is still outstanding across ${pendingCount} guest${
            pendingCount === 1 ? '' : 's'
          }.`;

  return (
    <>
      <Screen onRefresh={() => refetch()} ornament="wallet" refreshing={isRefetching}>
        <Reveal style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backRow}>
            <ChevronLeft color={theme.colors.mutedText} size={16} strokeWidth={2} />
            <Text color="muted" variant="caption">
              Back
            </Text>
          </Pressable>
          <Text color="muted" variant="caption">
            Split
          </Text>
          <Text style={styles.title} variant="display">
            Keep the table social, not spreadsheet-heavy.
          </Text>
          <Text color="muted" style={styles.copy}>
            The split stays attached to the original dinner so replies can settle back quietly without turning into invoice management.
          </Text>
        </Reveal>

        <Reveal delay={60}>
          <SplitCard split={data} />
        </Reveal>

        <Reveal delay={120} style={styles.section}>
          <SectionHeader
            eyebrow="Reply state"
            subtitle="The split should feel like a live social thread, not a frozen reimbursement log."
            title="How the table is resolving"
          />
          <Card variant="quiet">
            <View style={styles.summaryHeader}>
              <View style={styles.summaryCopy}>
                <Text variant="label">{summaryHeadline}</Text>
                <Text color="muted" style={styles.summaryDetail}>
                  {summaryDetail}
                </Text>
              </View>
              <Badge
                label={`${paidCount} paid · ${pendingCount} pending`}
                tone={data.status === 'settled' ? 'success' : data.status === 'partially_settled' ? 'forest' : 'pending'}
              />
            </View>
            <View style={styles.summaryMetrics}>
              <View style={[styles.summaryMetric, { backgroundColor: theme.colors.sheet }]}>
                <Text variant="label">{formatMoney(data.requestedBack)}</Text>
                <Text color="muted" variant="caption">
                  Total requested back
                </Text>
              </View>
              <View style={[styles.summaryMetric, { backgroundColor: theme.colors.sheet }]}>
                <Text variant="label">
                  {formatMoney({
                    ...data.requestedBack,
                    amount: data.status === 'pending' ? remainingAmount : settledBackAmount,
                  })}
                </Text>
                <Text color="muted" variant="caption">
                  {data.status === 'pending' ? 'Still pending' : 'Returned back'}
                </Text>
              </View>
            </View>
          </Card>
        </Reveal>

        <Reveal delay={160} style={styles.section}>
          <SectionHeader
            eyebrow="Participants"
            subtitle="Each guest keeps one share and one clear state."
            title="Who still owes"
          />
          <Card variant="default">
            <View style={styles.participantList}>
              {data.participants.map((participant, index) => (
                <View
                  key={participant.id}
                  style={[
                    styles.participantRow,
                    index < data.participants.length - 1
                      ? { borderBottomColor: theme.colors.softLine, borderBottomWidth: StyleSheet.hairlineWidth }
                      : null,
                  ]}>
                  <View style={styles.participantCopy}>
                    <Text variant="label">{participant.name}</Text>
                    <Text color="muted" style={styles.participantSubtitle}>
                      {participant.status === 'paid'
                        ? `Settled ${participant.settledAt ? formatTimestamp(participant.settledAt) : 'recently'}`
                        : 'Waiting on reply'}
                    </Text>
                  </View>
                  <View style={styles.participantTrailing}>
                    <Text variant="label">{formatMoney(participant.share)}</Text>
                    <Badge label={participant.status === 'paid' ? 'Paid' : 'Pending'} tone={participant.status === 'paid' ? 'success' : 'pending'} />
                    <Button
                      label={participant.status === 'paid' ? 'Mark pending' : 'Mark paid'}
                      onPress={() => {
                        void triggerHaptic('soft');
                        toggleSplitParticipantPaid(data.id, participant.id);
                      }}
                      variant="quiet"
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </Reveal>

        <Reveal delay={220} style={styles.section}>
          <SectionHeader
            eyebrow="Receipt context"
            subtitle="The original dinner stays attached so there is no detached money trail."
            title="What stays anchored"
          />
          <Card variant="quiet">
            <View style={styles.contextRow}>
              <View style={styles.contextCopy}>
                <Text variant="label">{data.venueName}</Text>
                <Text color="muted">{data.note}</Text>
              </View>
              <Badge label={formatMoney(data.total)} tone="neutral" />
            </View>
          </Card>
        </Reveal>
      </Screen>

      <BottomActionBar>
        <Button
          label={canEdit ? 'Edit split' : 'Back home'}
          onPress={() => {
            if (canEdit) {
              void triggerHaptic('soft');
              editRef.current?.present();
              return;
            }

            router.replace('/');
          }}
        />
      </BottomActionBar>

      <SplitFollowUpSheet
        initialParticipants={data.participants}
        mode="edit"
        onSubmit={(participants) => {
          updateSplitParticipants(data.id, participants);
          showToast({
            title: 'Split updated',
            description: 'The guest list and shares now match the revised table.',
            tone: 'success',
          });
        }}
        ref={editRef}
        source={{
          id: data.receiptId,
          total: data.total,
          venueName: data.venueName,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  backRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  title: {
    marginTop: 14,
    maxWidth: 320,
  },
  copy: {
    marginTop: 12,
    maxWidth: 332,
  },
  section: {
    marginTop: 24,
  },
  participantList: {
    gap: 4,
  },
  participantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  participantCopy: {
    flex: 1,
  },
  participantSubtitle: {
    marginTop: 4,
  },
  participantTrailing: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 122,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryCopy: {
    flex: 1,
    gap: 6,
    paddingRight: 10,
  },
  summaryDetail: {
    maxWidth: 280,
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryMetric: {
    borderRadius: 18,
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  contextRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  contextCopy: {
    flex: 1,
    gap: 6,
  },
});
