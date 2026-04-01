import type { ActivityStatus, MembershipTier, Money, PaymentStatus } from '@corridor/domain';

export function formatMoney(value: Money, options?: { compact?: boolean; absolute?: boolean }) {
  const amount = options?.absolute ? Math.abs(value.amount) : value.amount;

  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: value.currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    notation: options?.compact ? 'compact' : 'standard',
  }).format(amount);
}

export function formatMoneySigned(value: Money, direction: 'credit' | 'debit') {
  const prefix = direction === 'credit' ? '+' : '-';
  return `${prefix}${formatMoney(value, { absolute: true })}`;
}

export function formatRelativeTime(isoDate: string) {
  const then = new Date(isoDate).getTime();

  if (Number.isNaN(then)) {
    return 'Recently';
  }

  const now = Date.now();
  const diffMs = now - then;

  if (diffMs <= 0) {
    return 'Just now';
  }

  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatTimestamp(isoDate: string) {
  const value = new Date(isoDate);

  if (Number.isNaN(value.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-AE', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

export function titleCase(value: string) {
  return value.replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
}

export function tierLabel(tier: MembershipTier) {
  if (tier === 'founding') return 'Founding';
  if (tier === 'circle') return 'Circle';
  return 'Guest';
}

export function statusLabel(status: ActivityStatus | PaymentStatus) {
  if (status === 'settled' || status === 'success') return 'Settled';
  if (status === 'pending') return 'Pending';
  if (status === 'failed') return 'Failed';
  return titleCase(status);
}
