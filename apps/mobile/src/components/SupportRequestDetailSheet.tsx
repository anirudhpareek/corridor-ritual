import type { SupportRequestPreview } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CircleAlert, Clock3, Headphones, ReceiptText } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatMoneySigned, formatRelativeTime, formatTimestamp, statusLabel, titleCase } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';

type Props = {
  preview: SupportRequestPreview | null;
};

function requestTone(preview: SupportRequestPreview) {
  if (preview.status === 'reviewing') {
    return 'pending' as const;
  }

  if (preview.movementStatus === 'failed') {
    return 'danger' as const;
  }

  return 'neutral' as const;
}

function supportNarrative(preview: SupportRequestPreview) {
  if (preview.status === 'reviewing') {
    return 'Support is already tracing the original receipt with the venue or settlement context attached. You do not need to restart the issue from scratch.';
  }

  if (preview.movementStatus === 'pending') {
    return 'This request is queued with the original pending receipt already attached, so support can review the state you saw without asking you to retell it.';
  }

  if (preview.movementStatus === 'failed') {
    return 'This request was attached directly to a failed receipt, so support can confirm that the corridor did not create a duplicate settled charge.';
  }

  return 'Support has the settled receipt, the issue you selected, and the original timing. The request stays tied to that movement instead of becoming a disconnected ticket.';
}

function nextStepCopy(preview: SupportRequestPreview) {
  if (preview.status === 'reviewing') {
    return 'Keep the original receipt unchanged and let support finish the trace. If the venue asks again, this request already carries the context they need.';
  }

  if (preview.movementStatus === 'pending') {
    return 'Wait for the receipt state to settle unless support asks for something else. The original payment or top-up can keep moving while this request stays attached.';
  }

  return 'Nothing else needs to happen right now. This request remains attached to the receipt trail and will show up again here if support needs a follow-up.';
}

export const SupportRequestDetailSheet = forwardRef<BottomSheetModal, Props>(function SupportRequestDetailSheet(
  { preview },
  ref,
) {
  const theme = useTheme();

  if (!preview) {
    return null;
  }

  const Icon = preview.status === 'reviewing' ? Clock3 : preview.movementStatus === 'failed' ? CircleAlert : Headphones;

  const iconColors =
    preview.status === 'reviewing'
      ? { backgroundColor: theme.colors.pendingSoft, foreground: theme.colors.pending }
      : preview.movementStatus === 'failed'
        ? { backgroundColor: theme.colors.dangerSoft, foreground: theme.colors.danger }
        : { backgroundColor: theme.colors.brassSoft, foreground: theme.colors.brass };

  return (
    <Sheet
      ref={ref}
      snapPoints={['58%']}
      subtitle="Each request should stay anchored to the original receipt instead of becoming a floating support thread."
      title="Support request detail">
      <View style={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
          <View style={styles.heroHeader}>
            <View style={[styles.iconWrap, { backgroundColor: iconColors.backgroundColor }]}>
              <Icon color={iconColors.foreground} size={18} strokeWidth={1.8} />
            </View>
            <View style={styles.heroCopy}>
              <Text color="muted" variant="caption">
                {preview.status === 'reviewing' ? 'Under review' : 'Queued with support'}
              </Text>
              <Text style={styles.heroTitle} variant="title">
                {preview.reason}
              </Text>
            </View>
            <Badge label={titleCase(preview.status)} tone={requestTone(preview)} />
          </View>

          <Text color="muted" style={styles.heroDetail}>
            Added {formatRelativeTime(preview.createdAt)}. Support keeps the issue and the receipt state together.
          </Text>
        </View>

        <View style={[styles.block, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
          <View style={styles.blockHeader}>
            <ReceiptText color={theme.colors.brass} size={16} strokeWidth={1.8} />
            <Text variant="label">Attached receipt</Text>
          </View>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptCopy}>
              <Text variant="label">{preview.receiptTitle}</Text>
              <Text color="muted" style={styles.receiptSubtitle}>
                {preview.receiptSubtitle}
              </Text>
            </View>
            <Badge
              label={`${titleCase(preview.movementKind)} · ${statusLabel(preview.movementStatus)}`}
              tone={preview.movementStatus === 'failed' ? 'danger' : preview.movementStatus === 'pending' ? 'pending' : 'neutral'}
            />
          </View>
          <View style={styles.receiptMeta}>
            <Text variant="label">{formatMoneySigned(preview.amount, preview.direction)}</Text>
            <Text color="muted" variant="caption">
              {formatTimestamp(preview.createdAt)}
            </Text>
          </View>
        </View>

        <View style={[styles.block, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            What support is doing
          </Text>
          <Text>{supportNarrative(preview)}</Text>
        </View>

        <View style={[styles.block, { backgroundColor: theme.colors.sheet, borderColor: theme.colors.softLine }]}>
          <Text color="muted" variant="caption">
            What you should do now
          </Text>
          <Text>{nextStepCopy(preview)}</Text>
        </View>

        <Button
          label="Done"
          onPress={() => {
            if (ref && 'current' in ref) {
              ref.current?.dismiss();
            }
          }}
          variant="secondary"
        />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  hero: {
    borderRadius: 24,
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  heroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    marginTop: 8,
  },
  heroDetail: {
    maxWidth: 310,
  },
  block: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  blockHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  receiptHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  receiptCopy: {
    flex: 1,
    paddingRight: 10,
  },
  receiptSubtitle: {
    marginTop: 4,
  },
  receiptMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
