// Preset time ranges for the dashboard.
//
// - "live" mode streams the most recent `pageSize` readings via limitToLast.
//   New readings push in, old ones drop off, and "Load older" paginates back.
// - "range" mode queries a fixed time window (now - rangeMs) at the moment of
//   selection. New matching readings still stream in via onValue, but the
//   lower bound stays frozen — re-select the preset to slide the window.
//   rangeMs === null means "no lower bound" (capped by MAX_RANGE_RESULTS in
//   the hook).

export const TIME_RANGES = [
    {
        id: 'live',
        label: 'Live',
        description: null,
        mode: 'live',
        rangeMs: null,
    },
    {
        id: '15m',
        label: '15m',
        description: 'Over last 15 minutes',
        mode: 'range',
        rangeMs: 15 * 60 * 1000,
    },
    {
        id: '1h',
        label: '1h',
        description: 'Over last hour',
        mode: 'range',
        rangeMs: 60 * 60 * 1000,
    },
    {
        id: '6h',
        label: '6h',
        description: 'Over last 6 hours',
        mode: 'range',
        rangeMs: 6 * 60 * 60 * 1000,
    },
    {
        id: '24h',
        label: '24h',
        description: 'Over last 24 hours',
        mode: 'range',
        rangeMs: 24 * 60 * 60 * 1000,
    },
    {
        id: '7d',
        label: '7d',
        description: 'Over last 7 days',
        mode: 'range',
        rangeMs: 7 * 24 * 60 * 60 * 1000,
    },
    {
        id: 'all',
        label: 'All',
        description: 'Over all loaded readings',
        mode: 'range',
        rangeMs: null,
    },
];

export const DEFAULT_TIME_RANGE_ID = 'live';

export const getTimeRangeById = (id) =>
    TIME_RANGES.find((r) => r.id === id) ??
    TIME_RANGES.find((r) => r.id === DEFAULT_TIME_RANGE_ID);

// Sublabel shown under the Average / Min / Max stat cards.
export const formatWindowLabel = (range, count) => {
    if (!range || range.mode === 'live') {
        return count === 1
            ? 'Over last reading'
            : `Over last ${count} readings`;
    }
    return range.description;
};
