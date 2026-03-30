import type { Venue } from '@corridor/domain';

import type { AppTheme } from '../theme/tokens';

type VenueTonePalette = {
  solid: string;
  soft: string;
  accent: string;
};

export function getVenueTonePalette(imageTone: Venue['imageTone'], theme: AppTheme): VenueTonePalette {
  if (imageTone === 'forest') {
    return {
      solid: theme.colors.forest,
      soft: theme.colors.successSoft,
      accent: theme.colors.success,
    };
  }

  if (imageTone === 'sand') {
    return {
      solid: theme.colors.brass,
      soft: theme.colors.brassSoft,
      accent: theme.colors.pending,
    };
  }

  return {
    solid: theme.colors.inkSoft,
    soft: theme.colors.elevated,
    accent: theme.colors.primaryText,
  };
}
