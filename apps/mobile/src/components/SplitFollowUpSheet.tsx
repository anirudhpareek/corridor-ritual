import type { Money, SplitParticipant } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Minus, Plus, UsersRound } from 'lucide-react-native';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type SplitSource = {
  id: string;
  total: Money;
  venueName: string;
};

type Props = {
  source: SplitSource;
  initialParticipants?: SplitParticipant[];
  mode?: 'create' | 'edit';
  onSubmit: (participants: SplitParticipant[]) => void;
};

const suggestedGuests = ['Rohan', 'Maya', 'Sara', 'Dev', 'Isha'] as const;

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function buildEqualParticipants(source: SplitSource, participantCount: number): SplitParticipant[] {
  const share = roundCurrency(source.total.amount / (participantCount + 1));

  return suggestedGuests.slice(0, participantCount).map((guest, index) => ({
    id: `draft_${source.id}_${index + 1}`,
    name: guest,
    share: {
      ...source.total,
      amount: share,
    },
    status: 'pending',
  }));
}

function sumShares(participants: SplitParticipant[]) {
  return roundCurrency(participants.reduce((total, participant) => total + participant.share.amount, 0));
}

export const SplitFollowUpSheet = forwardRef<BottomSheetModal, Props>(function SplitFollowUpSheet(
  { initialParticipants, mode = 'create', onSubmit, source },
  ref,
) {
  const theme = useTheme();
  const [participants, setParticipants] = useState<SplitParticipant[]>(
    initialParticipants?.length ? initialParticipants : buildEqualParticipants(source, 3),
  );

  useEffect(() => {
    setParticipants(initialParticipants?.length ? initialParticipants : buildEqualParticipants(source, 3));
  }, [initialParticipants, source.id, source.total.amount, source.total.currency, source.venueName]);

  const canEditShares = participants.every((participant) => participant.status === 'pending');
  const requestedBackAmount = useMemo(() => sumShares(participants), [participants]);
  const youKeepAmount = roundCurrency(Math.max(source.total.amount - requestedBackAmount, 0));
  const invalidAmount = requestedBackAmount <= 0 || requestedBackAmount > source.total.amount;

  const updateParticipantCount = (nextCount: number) => {
    if (!canEditShares) {
      return;
    }

    setParticipants(buildEqualParticipants(source, Math.min(Math.max(nextCount, 2), 5)));
  };

  const adjustShare = (participantId: string, delta: number) => {
    if (!canEditShares) {
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              share: {
                ...participant.share,
                amount: roundCurrency(Math.max(participant.share.amount + delta, 5)),
              },
            }
          : participant,
      ),
    );
  };

  const participantCount = participants.length;
  const actionLabel = mode === 'edit' ? 'Update split' : `Send ${participantCount} requests`;

  return (
    <Sheet
      ref={ref}
      snapPoints={[mode === 'edit' ? '72%' : '68%']}
      subtitle="Keep the table social while the receipt is still fresh. Requests stay tied to this exact spend."
      title={mode === 'edit' ? 'Edit split' : 'Split this table'}>
      <View style={styles.content}>
        <View style={styles.heroRow}>
          <UsersRound color={theme.colors.brass} size={18} strokeWidth={1.8} />
          <View style={styles.heroCopy}>
            <Text variant="label">{source.venueName}</Text>
            <Text color="muted">
              {mode === 'edit'
                ? 'Adjust the guest list and shares while the split is still pending.'
                : 'You covered the table. Set the guest list once and let replies settle back quietly.'}
            </Text>
          </View>
        </View>

        <View style={[styles.amountCard, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <View style={styles.amountHeader}>
            <View>
              <Text color="muted" variant="caption">
                Requested back
              </Text>
              <Text variant="title">{formatMoney({ ...source.total, amount: requestedBackAmount })}</Text>
            </View>
            <Badge label={`You keep ${formatMoney({ ...source.total, amount: youKeepAmount })}`} tone="forest" />
          </View>
          <Text color="muted" variant="caption">
            The total stays attached to the original table, with the member perk already reflected in the final bill.
          </Text>
        </View>

        <View style={[styles.countRow, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
          <Text variant="label">Guests</Text>
          <View style={styles.countControls}>
            <Pressable
              accessibilityRole="button"
              onPress={() => updateParticipantCount(participantCount - 1)}
              style={[styles.countButton, { borderColor: theme.colors.softLine, opacity: canEditShares ? 1 : 0.42 }]}>
              <Minus color={theme.colors.primaryText} size={14} strokeWidth={2} />
            </Pressable>
            <Text variant="label">{participantCount}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => updateParticipantCount(participantCount + 1)}
              style={[styles.countButton, { borderColor: theme.colors.softLine, opacity: canEditShares ? 1 : 0.42 }]}>
              <Plus color={theme.colors.primaryText} size={14} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.peopleList}>
          {participants.map((participant) => (
            <View
              key={participant.id}
              style={[
                styles.personRow,
                {
                  backgroundColor: theme.colors.sheet,
                  borderColor: theme.colors.softLine,
                },
              ]}>
              <View style={styles.personCopy}>
                <Text variant="label">{participant.name}</Text>
                <Text color="muted" variant="caption">
                  {participant.status === 'paid' ? 'Already settled' : 'Still pending'}
                </Text>
              </View>
              <View style={styles.personControls}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => adjustShare(participant.id, -5)}
                  style={[styles.shareButton, { borderColor: theme.colors.softLine, opacity: canEditShares ? 1 : 0.42 }]}>
                  <Minus color={theme.colors.primaryText} size={12} strokeWidth={2} />
                </Pressable>
                <Text style={styles.personAmount} variant="label">
                  {formatMoney(participant.share)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => adjustShare(participant.id, 5)}
                  style={[styles.shareButton, { borderColor: theme.colors.softLine, opacity: canEditShares ? 1 : 0.42 }]}>
                  <Plus color={theme.colors.primaryText} size={12} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Text color={invalidAmount ? 'danger' : 'muted'} variant="caption">
          {invalidAmount
            ? 'Keep the requested total between zero and the original table total.'
            : canEditShares
              ? 'Equal split comes first, then small edits if one guest should cover a little more.'
              : 'Once a guest has already settled, this split stays fixed in the prototype.'}
        </Text>

        <Button
          disabled={invalidAmount}
          label={actionLabel}
          onPress={() => {
            onSubmit(participants);
            if (ref && 'current' in ref) {
              ref.current?.dismiss();
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
    gap: 4,
  },
  amountCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  amountHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  countRow: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  countControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  countButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  peopleList: {
    gap: 10,
  },
  personRow: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  personCopy: {
    flex: 1,
    gap: 2,
  },
  personControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  shareButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  personAmount: {
    minWidth: 64,
    textAlign: 'center',
  },
});
