import { formatRelativeTime } from '../format';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-29T06:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('clamps future timestamps to a calm immediate label', () => {
    expect(formatRelativeTime('2026-03-29T06:10:00.000Z')).toBe('Just now');
  });

  it('formats past timestamps without negative output', () => {
    expect(formatRelativeTime('2026-03-29T05:10:00.000Z')).toBe('50m ago');
    expect(formatRelativeTime('2026-03-28T06:00:00.000Z')).toBe('1d ago');
  });

  it('falls back cleanly for invalid dates', () => {
    expect(formatRelativeTime('not-a-date')).toBe('Recently');
  });
});
