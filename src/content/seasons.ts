import { gregorianToHijri } from '@tabby_ai/hijri-converter';

export type Season = 'ramadan' | 'eid' | 'sahel' | 'exams';
type HijriDay = { month: number; day: number };

export function hijriDay(date: Date, useIntl = true): HijriDay | null {
  try {
    if (!useIntl) throw new Error('Intl unavailable');
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
      month: 'numeric', day: 'numeric',
    });
    if (formatter.resolvedOptions().calendar === 'islamic-umalqura') {
      const parts = formatter.formatToParts(date);
      const month = Number(parts.find((part) => part.type === 'month')?.value);
      const day = Number(parts.find((part) => part.type === 'day')?.value);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 30) return { month, day };
    }
  } catch {
    // Some native runtimes do not expose this calendar through Intl.
  }
  try {
    const converted = gregorianToHijri({
      year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
    });
    return { month: converted.month, day: converted.day };
  } catch {
    return null;
  }
}

export function detectSeason(date: Date): Season | null {
  const hijri = hijriDay(date);
  if (hijri?.month === 9) return 'ramadan';
  if (hijri && ((hijri.month === 10 && hijri.day <= 4) ||
    (hijri.month === 12 && hijri.day >= 9 && hijri.day <= 13))) return 'eid';
  const month = date.getMonth() + 1;
  if (month === 7 || month === 8) return 'sahel';
  if (month === 1 || month === 5 || month === 6) return 'exams';
  return null;
}
