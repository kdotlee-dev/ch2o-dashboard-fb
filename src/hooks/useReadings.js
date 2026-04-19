import { useCallback, useEffect, useState } from 'react';
import {
    limitToLast,
    onValue,
    orderByChild,
    query,
    ref,
    remove,
    startAt,
} from 'firebase/database';
import { db, READINGS_PATH } from '@/lib/firebase';

// Upper bound for range-mode queries so a wide window on a chatty sensor
// (e.g. 7 days at ~1 Hz is ~600k points) doesn't flood the client. If the
// window contains more readings than this, only the most recent MAX are
// returned — acceptable for a dashboard, and consistent with the live feed
// using limitToLast.
const MAX_RANGE_RESULTS = 5000;

// The device stores unix seconds. JS Date expects ms. Anything under ~1e12
// is treated as seconds, otherwise milliseconds.
const toTimestamp = (raw) => {
    if (raw == null) return null;
    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) return null;
        return raw < 1e12 ? raw * 1000 : raw;
    }
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
        return asNumber < 1e12 ? asNumber * 1000 : asNumber;
    }
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? null : parsed;
};

// The RTDB row key itself is the unix-seconds timestamp when time was synced,
// or "boot_<millis>" otherwise. Use the key as a fallback source of truth.
const timestampFromKey = (key) => {
    if (!key || typeof key !== 'string') return null;
    if (key.startsWith('boot_')) return null;
    return toTimestamp(key);
};

const toNumber = (raw) => {
    if (raw == null) return NaN;
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isNaN(n) ? NaN : n;
};

const normalizeReading = (id, value) => {
    const src = value && typeof value === 'object' ? value : {};
    const timestamp =
        toTimestamp(
            src.timestamp_unix_s ??
                src.timestamp ??
                src.time ??
                src.ts ??
                src.createdAt
        ) ?? timestampFromKey(id);

    // Wi-Fi is whatever the device chooses to report. Some firmwares send a
    // descriptive string ("good"), others send a numeric RSSI in dBm (-58).
    // Accept either; callers format accordingly. If the field isn't present
    // (as in the current firmware), the whole Wi-Fi line is hidden in the UI.
    const rawWifi = src.wifi ?? src.rssi ?? src.wifi_rssi;
    const wifi =
        typeof rawWifi === 'string'
            ? rawWifi
            : typeof rawWifi === 'number' && Number.isFinite(rawWifi)
                ? rawWifi
                : null;

    return {
        id,
        timestamp,
        ch2o: toNumber(
            src.ch2o_ppm ?? src.ch2o ?? src.hcho ?? src.value ?? src.ppm
        ),
        level: typeof src.level === 'string' ? src.level : null,
        wifi,
        uptimeMs: toNumber(src.uptime_ms ?? src.uptimeMs),
    };
};

// Build the RTDB query for the requested feed mode. `mode` is 'live' or
// 'range'; `rangeMs` is the lookback window in ms for range mode (null means
// "no lower bound" / "All").
//
// Note: orderByChild('timestamp_unix_s') will emit a console warning from
// Firebase unless you add `.indexOn: ["timestamp_unix_s"]` in the RTDB
// security rules. The query still returns correct results without the index.
const buildReadingsQuery = ({ path, mode, rangeMs, liveLimit }) => {
    const base = ref(db, path);
    if (mode === 'range') {
        const constraints = [orderByChild('timestamp_unix_s')];
        if (Number.isFinite(rangeMs) && rangeMs > 0) {
            // Device writes timestamp_unix_s in seconds.
            const startSec = (Date.now() - rangeMs) / 1000;
            constraints.push(startAt(startSec));
        }
        constraints.push(limitToLast(MAX_RANGE_RESULTS));
        return query(base, ...constraints);
    }
    return query(base, limitToLast(liveLimit));
};

export const useReadings = ({
    path = READINGS_PATH,
    pageSize = 100,
    mode = 'live',
    rangeMs = null,
} = {}) => {
    const [readings, setReadings] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(pageSize);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(mode === 'live');

    // Swapping path, pageSize, or the range selection invalidates pagination.
    useEffect(() => {
        setLimit(pageSize);
        setHasMore(mode === 'live');
    }, [path, pageSize, mode, rangeMs]);

    useEffect(() => {
        setStatus((prev) => (prev === 'ready' ? prev : 'loading'));
        const readingsQuery = buildReadingsQuery({
            path,
            mode,
            rangeMs,
            liveLimit: limit,
        });
        const unsubscribe = onValue(
            readingsQuery,
            (snapshot) => {
                const data = snapshot.val();
                const list = data
                    ? Object.entries(data).map(([id, value]) =>
                          normalizeReading(id, value)
                      )
                    : [];
                // Newest first. Rows with no usable timestamp sink to the bottom.
                list.sort(
                    (a, b) =>
                        (b.timestamp ?? -Infinity) - (a.timestamp ?? -Infinity)
                );
                setReadings(list);
                if (mode === 'live') {
                    // Fewer rows than requested means we've reached the very
                    // first entry in the database — nothing older to fetch.
                    setHasMore(list.length >= limit);
                } else {
                    // Range mode is bounded by time, not by a paginated
                    // cursor, so "Load older" doesn't apply.
                    setHasMore(false);
                }
                setError(null);
                setStatus('ready');
                setLoadingMore(false);
            },
            (err) => {
                setError(err);
                setStatus('error');
                setLoadingMore(false);
            }
        );
        return () => unsubscribe();
    }, [path, mode, rangeMs, limit]);

    const clearAll = useCallback(async () => {
        await remove(ref(db, path));
        // Wiping the table means any paginated window is stale. Reset it so
        // new rows can build up and "Load older" reappears naturally (live
        // mode only).
        setLimit(pageSize);
        setHasMore(mode === 'live');
    }, [path, pageSize, mode]);

    const deleteReading = useCallback(
        (id) => remove(ref(db, `${path}/${id}`)),
        [path]
    );

    const loadMore = useCallback(() => {
        if (mode !== 'live' || !hasMore || loadingMore) return;
        setLoadingMore(true);
        setLimit((prev) => prev + pageSize);
    }, [mode, hasMore, loadingMore, pageSize]);

    return {
        readings,
        status,
        error,
        clearAll,
        deleteReading,
        loadMore,
        loadingMore,
        hasMore,
        pageSize,
        mode,
    };
};
