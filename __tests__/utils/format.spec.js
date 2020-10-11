import {
  formatSize,
  parseTime,
  formatTime,
  formatShortTime,
  parseSeekTime,
  formatSeekTime,
} from 'utils/format';

describe('formatSize is working properly', () => {
  test('formatSize exists', () => {
    expect(formatSize()).toBeDefined();
  });

  test('value is zero', () => {
    expect(formatSize(0, 2)).toEqual('N/A');
  });

  test('value is not zero', () => {
    expect(formatSize(16540654, 2)).toEqual('15.77 MB');
  });
});

describe('parseTime is working properly', () => {
  test('parseTime exists', () => {
    expect(parseTime()).toBeDefined();
  });

  test('returns properly', () => {
    expect(parseTime(254511)).toEqual({ days: 2, hours: 22, minutes: 41, ms: 0, seconds: 51 });
  });
});

describe('formatTime is working properly', () => {
  test('formatTime exists', () => {
    expect(parseTime()).toBeDefined();
  });

  test('hours is less than than zero', () => {
    expect(formatTime(264)).toEqual('4:24');
  });

  test('hours is greater than than zero', () => {
    expect(formatTime(25451)).toEqual('7:04:11');
  });
});

describe('formatShortTime is working properly', () => {
  test('formatShortTime exists', () => {
    expect(formatShortTime()).toBeDefined();
  });

  test('val is equal to zero', () => {
    expect(formatShortTime(0)).toEqual('0s');
  });

  test('days is greater than than zero & format = d', () => {
    expect(formatShortTime(254511, ['d'])).toEqual('2d');
  });

  test('hours is greater than than zero & format = h', () => {
    expect(formatShortTime(25451, ['h'])).toEqual('7h');
  });

  test('minutes is greater than than zero & format = m', () => {
    expect(formatShortTime(25451, ['m'])).toEqual('4m');
  });

  test('seconds is greater than than zero & format = s', () => {
    expect(formatShortTime(25451, ['s'])).toEqual('11s');
  });

  test('ms is greater than than zero & format = ms', () => {
    expect(formatShortTime(250.25, ['ms'])).toEqual('250ms');
  });

  test('correct output with default format', () => {
    expect(formatShortTime(254511)).toEqual('41m51s');
  });

  test('correct output with format', () => {
    expect(formatShortTime(254500.25, ['d', 'h', 'm', 's', 'ms'])).toEqual('2d22h41m40s250ms');
  });

  test('correct output with double spaces', () => {
    expect(formatShortTime(254511, ['m', 's'], '  ')).toEqual('41m  51s  ');
  });
});

describe('parseSeekTime is working properly', () => {
  test('parseSeekTime exists', () => {
    expect(parseSeekTime('')).toBeDefined();
  });

  test('val does not match regex', () => {
    expect(parseSeekTime('060')).toBeNull();
  });

  test('has hours', () => {
    expect(parseSeekTime('5:51:60')).toEqual(21120);
  });

  test('has no hours', () => {
    expect(parseSeekTime('51:60')).toEqual(3120);
  });
});

describe('formatSeekTime is working properly', () => {
  test('formatSeekTime exists', () => {
    expect(formatSeekTime()).toBeDefined();
  });

  test('formats seek time properly', () => {
    expect(formatSeekTime(65489)).toEqual('18:11:29');
  });
});
