import type { SplitRequest } from '@corridor/domain';

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function getSplitLabel(status: SplitRequest['status']) {
  if (status === 'settled') {
    return 'Settled';
  }

  if (status === 'partially_settled') {
    return 'Partially settled';
  }

  return 'Pending';
}

export function getSplitTone(status: SplitRequest['status']) {
  if (status === 'settled') {
    return 'success' as const;
  }

  if (status === 'partially_settled') {
    return 'forest' as const;
  }

  return 'pending' as const;
}

export function getSplitCounts(split: SplitRequest) {
  const paidCount = split.participants.filter((participant) => participant.status === 'paid').length;
  const pendingCount = split.participants.length - paidCount;

  return {
    paidCount,
    pendingCount,
    totalCount: split.participants.length,
  };
}

export function getSplitAmounts(split: SplitRequest) {
  const settledBackAmount = roundCurrency(
    split.participants
      .filter((participant) => participant.status === 'paid')
      .reduce((total, participant) => total + participant.share.amount, 0),
  );
  const remainingAmount = roundCurrency(Math.max(split.requestedBack.amount - settledBackAmount, 0));

  return {
    remainingAmount,
    settledBackAmount,
  };
}

export function getSplitHomeMoment(status: SplitRequest['status']) {
  if (status === 'settled') {
    return {
      actionLabel: 'Review split',
      subtitle: 'The table closed out cleanly and stayed attached to the original dinner.',
      title: 'Last table closed out',
    };
  }

  if (status === 'partially_settled') {
    return {
      actionLabel: 'Open split',
      subtitle: 'One or more guests have already replied, so the table is in motion instead of just waiting.',
      title: 'One table is coming back',
    };
  }

  return {
    actionLabel: 'Open split',
    subtitle: 'Shared tables should live as a social thread, not a recovery ledger.',
    title: 'One table still moving',
  };
}
