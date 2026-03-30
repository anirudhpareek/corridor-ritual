import type { Money } from '@corridor/domain';
import { useEffect, useRef, useState } from 'react';

import { formatMoney } from '../lib/format';
import { Text } from '../ui/Text';

type Props = {
  value: Money;
  variant?: React.ComponentProps<typeof Text>['variant'];
  color?: React.ComponentProps<typeof Text>['color'];
  style?: React.ComponentProps<typeof Text>['style'];
};

export function AnimatedMoney({ color = 'primary', style, value, variant = 'title' }: Props) {
  const [displayAmount, setDisplayAmount] = useState(value.amount);
  const frameRef = useRef<number | null>(null);
  const previousRef = useRef(value.amount);

  useEffect(() => {
    const start = previousRef.current;
    const end = value.amount;
    const startedAt = Date.now();
    const duration = 360;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;

      setDisplayAmount(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value.amount]);

  return (
    <Text color={color} style={style} variant={variant}>
      {formatMoney({ ...value, amount: displayAmount })}
    </Text>
  );
}
