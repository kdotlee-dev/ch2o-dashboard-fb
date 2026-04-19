import { cn } from '@/lib/utils';
import { TIME_RANGES } from '@/lib/timeRanges';

export const TimeRangePicker = ({ value, onChange, disabled = false }) => {
    return (
        <div
            role='tablist'
            aria-label='Time range'
            className='inline-flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 shadow-sm'
        >
            {TIME_RANGES.map((r) => {
                const active = r.id === value;
                const a11yLabel =
                    r.description ??
                    (r.mode === 'live' ? 'Live streaming' : r.label);
                return (
                    <button
                        key={r.id}
                        type='button'
                        role='tab'
                        aria-selected={active}
                        aria-label={a11yLabel}
                        title={a11yLabel}
                        disabled={disabled}
                        onClick={() => onChange(r.id)}
                        className={cn(
                            'inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium tabular-nums',
                            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60',
                            active
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {r.mode === 'live' && (
                            <span
                                aria-hidden='true'
                                className={cn(
                                    'mr-1.5 h-1.5 w-1.5 rounded-full',
                                    active
                                        ? 'bg-emerald-500 animate-pulse'
                                        : 'bg-muted-foreground/60'
                                )}
                            />
                        )}
                        {r.label}
                    </button>
                );
            })}
        </div>
    );
};
