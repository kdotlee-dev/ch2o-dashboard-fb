import { useState } from 'react';
import { AlertCircle, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafetyLevel, getSafetyLevelByLabel } from '@/lib/safety';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const formatTimestamp = (reading) => {
    if (reading.timestamp != null) {
        return dateTimeFormatter.format(new Date(reading.timestamp));
    }
    if (typeof reading.id === 'string' && reading.id.startsWith('boot_')) {
        return 'Pre-sync';
    }
    return '—';
};

const formatCh2o = (value) =>
    Number.isNaN(value) ? '—' : `${value.toFixed(3)} ppm`;

const resolveLevel = (reading) =>
    getSafetyLevelByLabel(reading.level) ?? getSafetyLevel(reading.ch2o);

const SafetyBadge = ({ level }) => (
    <span
        className={cn(
            'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium',
            level.badge
        )}
    >
        <span className={cn('h-2 w-2 rounded-full', level.dot)} />
        {level.label}
    </span>
);

export const ReadingsTable = ({
    readings = [],
    status = 'ready',
    error = null,
    // clearAll,
    // deleteReading,
    loadMore,
    loadingMore = false,
    hasMore = false,
}) => {
    // const [mutating, setMutating] = useState(false);
    // const [mutationError, setMutationError] = useState(null);

    // const handleClearAll = async () => {
    //     if (mutating) return;
    //     const confirmed = window.confirm(
    //         `Delete all ${readings.length} readings from Firebase? This cannot be undone.`
    //     );
    //     if (!confirmed) return;

    //     setMutating(true);
    //     setMutationError(null);
    //     try {
    //         await clearAll();
    //     } catch (err) {
    //         setMutationError(err);
    //     } finally {
    //         setMutating(false);
    //     }
    // };

    // const handleDeleteRow = async (reading) => {
    //     if (mutating) return;
    //     const confirmed = window.confirm(
    //         `Delete the reading "${reading.id}"? This cannot be undone.`
    //     );
    //     if (!confirmed) return;

    //     setMutating(true);
    //     setMutationError(null);
    //     try {
    //         await deleteReading(reading.id);
    //     } catch (err) {
    //         setMutationError(err);
    //     } finally {
    //         setMutating(false);
    //     }
    // };

    const hasReadings = status === 'ready' && readings.length > 0;

    return (
        <div className='w-full max-w-5xl mx-auto'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4 px-1'>
                <div className='text-left'>
                    <h2 className='text-lg font-semibold'>Recent readings</h2>
                    <p className='text-sm text-muted-foreground'>
                        Live feed from the sensor via Firebase Realtime Database.
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <span className='text-xs text-muted-foreground tabular-nums'>
                        {status === 'ready' &&
                            `${readings.length} entries${hasMore ? '+' : ''}`}
                    </span>
                    {/*<button
                        type='button'
                        onClick={handleClearAll}
                        disabled={!hasReadings || mutating}
                        className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                            'border border-red-500/30 text-red-500 bg-red-500/5',
                            'transition-colors hover:bg-red-500/15 active:scale-95',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/5'
                        )}
                    >
                        {mutating ? (
                            <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        ) : (
                            <Trash2 className='h-3.5 w-3.5' />
                        )}
                        Clear all
                    </button>*/}
                </div>
            </div>

            {/* {mutationError && (
                <div className='mb-3 px-3 py-2 rounded-md border border-red-500/30 bg-red-500/10 text-red-500 text-xs flex items-center gap-2'>
                    <AlertCircle className='h-4 w-4 shrink-0' />
                    <span>
                        Delete failed
                        {mutationError.message ? `: ${mutationError.message}` : ''}
                    </span>
                </div>
            )} */}

            <div className='rounded-xl border border-border bg-card overflow-hidden shadow-sm'>
                <div className='max-h-[60vh] overflow-auto'>
                    <table className='w-full text-sm'>
                        <thead className='sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border'>
                            <tr className='text-left text-xs uppercase tracking-wider text-muted-foreground'>
                                <th className='px-4 py-3 font-semibold'>Date &amp; time</th>
                                <th className='px-4 py-3 font-semibold'>CH₂O level</th>
                                <th className='px-4 py-3 font-semibold'>Safety level</th>
                                {/* <th className='px-4 py-3 font-semibold text-right'>
                                    <span className='sr-only'>Actions</span>
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {status === 'loading' && (
                                <tr>
                                    {/* <td colSpan={4} className='px-4 py-10 text-center text-muted-foreground'> */}
                                    <td colSpan={3} className='px-4 py-10 text-center text-muted-foreground'>
                                        <Loader2 className='inline-block h-5 w-5 mr-2 animate-spin' />
                                        Connecting to Firebase…
                                    </td>
                                </tr>
                            )}

                            {status === 'error' && (
                                <tr>
                                    {/* <td colSpan={4} className='px-4 py-10 text-center text-red-500'> */}
                                    <td colSpan={3} className='px-4 py-10 text-center text-red-500'>
                                        <AlertCircle className='inline-block h-5 w-5 mr-2' />
                                        Failed to load readings
                                        {error?.message ? `: ${error.message}` : ''}
                                    </td>
                                </tr>
                            )}

                            {status === 'ready' && readings.length === 0 && (
                                <tr>
                                    {/* <td colSpan={4} className='px-4 py-10 text-center text-muted-foreground'> */}
                                    <td colSpan={3} className='px-4 py-10 text-center text-muted-foreground'>
                                        No readings yet. Waiting for the first data point…
                                    </td>
                                </tr>
                            )}

                            {status === 'ready' &&
                                readings.map((reading) => {
                                    const level = resolveLevel(reading);
                                    return (
                                        <tr
                                            key={reading.id}
                                            className='border-t border-border hover:bg-muted/40 transition-colors'
                                        >
                                            <td className='px-4 py-3 whitespace-nowrap tabular-nums text-foreground/90'>
                                                {formatTimestamp(reading)}
                                            </td>
                                            <td className='px-4 py-3 whitespace-nowrap tabular-nums font-medium'>
                                                {formatCh2o(reading.ch2o)}
                                            </td>
                                            <td className='px-4 py-3 whitespace-nowrap'>
                                                <SafetyBadge level={level} />
                                            </td>
                                            {/* <td className='px-4 py-3 whitespace-nowrap text-right'>
                                                <button
                                                    type='button'
                                                    onClick={() => handleDeleteRow(reading)}
                                                    disabled={mutating}
                                                    aria-label={`Delete reading ${reading.id}`}
                                                    className={cn(
                                                        'inline-flex items-center justify-center h-8 w-8 rounded-md',
                                                        'text-muted-foreground hover:text-red-500 hover:bg-red-500/10',
                                                        'transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                                                    )}
                                                >
                                                    <Trash2 className='h-4 w-4' />
                                                </button>
                                            </td> */}
                                        </tr>
                                    );
                                })}

                            {status === 'ready' && readings.length > 0 && (
                                <tr className='border-t border-border'>
                                    {/* <td colSpan={4} className='px-4 py-3 text-center'> */}
                                    <td colSpan={3} className='px-4 py-3 text-center'>
                                        {hasMore ? (
                                            <button
                                                type='button'
                                                onClick={loadMore}
                                                disabled={loadingMore}
                                                className={cn(
                                                    'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium',
                                                    'border border-border bg-background text-foreground/80',
                                                    'transition-colors hover:bg-muted/60 hover:text-foreground active:scale-95',
                                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                                )}
                                            >
                                                {loadingMore ? (
                                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                                ) : (
                                                    <ChevronDown className='h-3.5 w-3.5' />
                                                )}
                                                {loadingMore ? 'Loading…' : 'Load older'}
                                            </button>
                                        ) : (
                                            <span className='text-xs text-muted-foreground'>
                                                Beginning of history
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
