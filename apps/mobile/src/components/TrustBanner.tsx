import { ShieldCheck, ShieldQuestion, TimerReset } from 'lucide-react-native';

import { useTheme } from '../theme';
import { Banner } from '../ui/Banner';

type Props = {
  tone: 'guest' | 'member_preview' | 'verification_pending' | 'pending_funds' | 'calm';
};

export function TrustBanner({ tone }: Props) {
  const theme = useTheme();

  if (tone === 'calm') {
    return (
      <Banner
        description="You are cleared for corridor spend. Sensitive rails stay hidden until they matter."
        icon={<ShieldCheck color={theme.colors.success} size={18} strokeWidth={1.8} />}
        title="Quietly ready"
        tone="success"
      />
    );
  }

  if (tone === 'pending_funds') {
    return (
      <Banner
        description="Your latest top-up is still settling. Available and pending balances stay clearly separated."
        icon={<TimerReset color={theme.colors.pending} size={18} strokeWidth={1.8} />}
        title="Funds still processing"
        tone="warning"
      />
    );
  }

  if (tone === 'member_preview') {
    return (
      <Banner
        description="You are inside the network in preview mode. Verify only when you are ready to fund and spend."
        icon={<ShieldQuestion color={theme.colors.primaryText} size={18} strokeWidth={1.8} />}
        title="Member preview"
      />
    );
  }

  return (
    <Banner
      description={
        tone === 'guest'
          ? 'Browse the corridor freely. Verify only when you want to fund and spend.'
          : 'Verification is under review. You can still browse merchants while we finish checks.'
      }
      icon={<ShieldQuestion color={theme.colors.primaryText} size={18} strokeWidth={1.8} />}
      title={tone === 'guest' ? 'Guest mode' : 'Verification in review'}
    />
  );
}
