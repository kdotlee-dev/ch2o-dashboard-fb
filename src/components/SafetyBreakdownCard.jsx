import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getSafetyLevel, getSafetyLevelByLabel } from '@/lib/safety';

const resolveLevel = (reading) =>
    getSafetyLevelByLabel(reading.level) ?? getSafetyLevel(reading.ch2o);

const BAND_TONES = {
    SAFE: 'text-emerald-500',
    WARNING: 'text-yellow-500',
    DANGER: 'text-red-500',
};

const BAND_FILLS = {
    SAFE: 'bg-emerald-500',
    WARNING: 'bg-yellow-500',
    DANGER: 'bg-red-500',
};

const BAND_COPY = {
    SAFE: 'safe',
    WARNING: 'warning',
    DANGER: 'danger',
};

// Tiny rounding helper that avoids reporting "0%" for a non-empty band or
// "100%" when a sliver of another band exists — both mislead at a glance.
const formatPct = (pct) => {
    if (pct <= 0) return '0%';
    if (pct < 1) return '<1%';
    if (pct >= 99.5 && pct < 100) return '99%';
    return `${Math.round(pct)}%`;
};

export const SafetyBreakdownCard = ({ readings = [] }) => {
    const breakdown = useMemo(() => {
        const valid = readings.filter(
            (r) => Number.isFinite(r.ch2o) && Number.isFinite(r.timestamp)
        );
        if (valid.length === 0) return null;

        const counts = { SAFE: 0, WARNING: 0, DANGER: 0 };
        for (const r of valid) {
            const level = resolveLevel(r);
            if (counts[level.key] != null) counts[level.key] += 1;
        }
        const total = counts.SAFE + counts.WARNING + counts.DANGER;
        if (total === 0) return null;

        const pct = {
            SAFE: (counts.SAFE / total) * 100,
            WARNING: (counts.WARNING / total) * 100,
            DANGER: (counts.DANGER / total) * 100,
        };

        // The "headline" band is whichever takes up the most time — that's
        // the answer to "is this usually fine?".
        const dominant = ['SAFE', 'WARNING', 'DANGER'].reduce(
            (best, k) => (counts[k] > counts[best] ? k : best),
            'SAFE'
        );

        return { total, counts, pct, dominant };
    }, [readings]);

    return (
        <div className='flex flex-col rounded-lg border border-border bg-card/60 px-4 py-3 min-w-0'>
            <span className='text-[0.65rem] uppercase tracking-wider text-muted-foreground'>
                Time in band
            </span>

            {!breakdown ? (
                <>
                    <span className='mt-1 text-lg font-semibold text-muted-foreground'>
                        —
                    </span>
                    <div className='mt-2 h-1.5 w-full rounded-full bg-muted' />
                    <div className='mt-1.5 text-xs text-muted-foreground truncate'>
                        No readings yet
                    </div>
                </>
            ) : (
                <>
                    <span
                        className={cn(
                            'mt-1 text-lg font-semibold tabular-nums truncate',
                            BAND_TONES[breakdown.dominant]
                        )}
                    >
                        {formatPct(breakdown.pct[breakdown.dominant])}{' '}
                        {BAND_COPY[breakdown.dominant]}
                    </span>
                    <div
                        className='mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-muted'
                        role='img'
                        aria-label={`Safe ${formatPct(breakdown.pct.SAFE)}, warning ${formatPct(breakdown.pct.WARNING)}, danger ${formatPct(breakdown.pct.DANGER)}`}
                    >
                        {['SAFE', 'WARNING', 'DANGER'].map((k) =>
                            breakdown.pct[k] > 0 ? (
                                <div
                                    key={k}
                                    className={cn('h-full', BAND_FILLS[k])}
                                    style={{ width: `${breakdown.pct[k]}%` }}
                                />
                            ) : null
                        )}
                    </div>
                    <div className='mt-1.5 text-xs text-muted-foreground tabular-nums truncate'>
                        {formatPct(breakdown.pct.WARNING)} warning ·{' '}
                        {formatPct(breakdown.pct.DANGER)} danger
                    </div>
                </>
            )}
        </div>
    );
};
