import type { SupportRequestPreview } from '@corridor/domain';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ChevronRight, Headphones, MessageSquareQuote } from 'lucide-react-native';
import { forwardRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatRelativeTime, titleCase } from '../lib/format';
import { useTheme } from '../theme';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Sheet } from '../ui/Sheet';
import { Text } from '../ui/Text';
import { SupportRequestDetailSheet } from './SupportRequestDetailSheet';

type Props = {
  headline: string;
  detail: string;
  previews: SupportRequestPreview[];
};

export const SupportCenterSheet = forwardRef<BottomSheetModal, Props>(function SupportCenterSheet(
  { detail, headline, previews },
  ref,
) {
  const theme = useTheme();
  const detailRef = useRef<BottomSheetModal>(null);
  const [selectedPreview, setSelectedPreview] = useState<SupportRequestPreview | null>(null);

  return (
    <>
      <Sheet
        ref={ref}
        snapPoints={['72%']}
        subtitle="Support should keep the receipt context attached, not start from a blank ticket."
        title="Help and receipts">
        <View style={styles.content}>
          <View style={[styles.hero, { backgroundColor: theme.colors.elevated }]}>
            <View style={styles.heroHeader}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.brassSoft }]}>
                <Headphones color={theme.colors.brass} size={18} strokeWidth={1.8} />
              </View>
              <View style={styles.heroCopy}>
                <Text color="muted" variant="caption">
                  Support state
                </Text>
                <Text style={styles.heroTitle} variant="title">
                  {headline}
                </Text>
              </View>
            </View>
            <Text color="muted" style={styles.heroDetail}>
              {detail}
            </Text>
          </View>

          {previews.length ? (
            <View style={styles.list}>
              {previews.map((preview) => (
                <Pressable
                  accessibilityLabel={`Open support request for ${preview.receiptTitle}`}
                  accessibilityRole="button"
                  key={preview.id}
                  onPress={() => {
                    setSelectedPreview(preview);
                    detailRef.current?.present();
                  }}
                  style={[
                    styles.previewRow,
                    {
                      backgroundColor: theme.colors.sheet,
                      borderColor: theme.colors.softLine,
                    },
                  ]}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewCopy}>
                      <Text variant="label">{preview.receiptTitle}</Text>
                      <Text color="muted" style={styles.previewSubtitle}>
                        {preview.receiptSubtitle}
                      </Text>
                    </View>
                    <View style={styles.previewMeta}>
                      <Badge
                        label={titleCase(preview.status)}
                        tone={preview.status === 'reviewing' ? 'pending' : 'neutral'}
                      />
                      <ChevronRight color={theme.colors.mutedText} size={16} strokeWidth={2} />
                    </View>
                  </View>
                  <View style={styles.reasonRow}>
                    <MessageSquareQuote color={theme.colors.brass} size={16} strokeWidth={1.8} />
                    <Text style={styles.reasonText}>{preview.reason}</Text>
                  </View>
                  <Text color="muted" variant="caption">
                    Added {formatRelativeTime(preview.createdAt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              description="Once a receipt needs help, it should land here with the original context already attached."
              title="No support requests yet"
            />
          )}
        </View>
      </Sheet>

      <SupportRequestDetailSheet preview={selectedPreview} ref={detailRef} />
    </>
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
  },
  heroTitle: {
    marginTop: 8,
  },
  heroDetail: {
    maxWidth: 300,
  },
  list: {
    gap: 10,
  },
  previewRow: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  previewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  previewCopy: {
    flex: 1,
    paddingRight: 10,
  },
  previewMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  previewSubtitle: {
    marginTop: 4,
  },
  reasonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  reasonText: {
    flex: 1,
  },
});
