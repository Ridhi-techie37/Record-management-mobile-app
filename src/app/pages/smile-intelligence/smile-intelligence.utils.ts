import { SmileScanRecord, SmileScanResult } from '../../services/smile-intelligence/smile-scan.model';

/** Avoid shared array/object references from the API mutating multiple list rows. */
export function cloneSmileScanResult(s: SmileScanResult): SmileScanResult {
  return {
    ...s,
    recommendations: Array.isArray(s.recommendations) ? [...s.recommendations] : []
  };
}

/** Stable @for track for server scans (no id from API). */
export function remoteScanTrackId(scan: SmileScanResult, index: number): string {
  return [
    scan.createdAt ?? 'na',
    scan.smileScore,
    scan.alignmentScore,
    scan.gumHealthScore,
    scan.whitenessScore,
    scan.symmetryScore,
    scan.imageUrl ?? '',
    index
  ].join('\u001f');
}

export const SCORE_BREAKDOWN_LABELS: { key: keyof SmileScanResult; label: string }[] = [
  { key: 'alignmentScore', label: 'Alignment' },
  { key: 'gumHealthScore', label: 'Gum Health' },
  { key: 'whitenessScore', label: 'Whiteness' },
  { key: 'symmetryScore', label: 'Symmetry' }
];

export function getScoreColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}

export function getConfidencePercent(scan: { confidenceScore: number }): number {
  const c = scan.confidenceScore;
  return c <= 1 ? Math.round(c * 100) : Math.round(c);
}

export function getScoreValue(scan: SmileScanRecord | SmileScanResult, key: keyof SmileScanResult): number {
  const v = scan[key];
  return typeof v === 'number' ? v : 0;
}

export function getScoreMessage(score: number): { emoji: string; text: string } {
  if (score >= 70) return { emoji: '\uD83D\uDE0A', text: 'Great smile! Keep up the good habits.' };
  if (score >= 40) return { emoji: '\uD83D\uDC4D', text: 'Good overall. Room to improve.' };
  return { emoji: '\uD83D\uDCA1', text: 'Consider a check-up for advice.' };
}

export function getScanDateDisplay(record: SmileScanRecord | SmileScanResult): string {
  if (record.createdAt) {
    return new Date(record.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  if ('scannedAt' in record && record.scannedAt) {
    return new Date(record.scannedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return '';
}

export function plaqueBadgeClass(level: string | null | undefined): string {
  if (level === 'Low') return 'plaque-badge plaque-badge--low';
  if (level === 'High') return 'plaque-badge plaque-badge--high';
  return 'plaque-badge plaque-badge--mid';
}

export function formatDateShort(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCreatedAt(createdAt: string | null | undefined): string {
  if (!createdAt) return '';
  return formatDateShort(new Date(createdAt));
}
