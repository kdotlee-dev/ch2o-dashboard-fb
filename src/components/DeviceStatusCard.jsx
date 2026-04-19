import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

// Thresholds for the "is the sensor alive?" traffic light. Tune to roughly
// match the device's expected sample rate — the current ESP32 firmware emits
// a reading every few seconds, so anything beyond 30s is almost certainly
// a network hiccup rather than normal cadence.
const STATUS_ONLINE_MAX_MS = 30 * 1000;
const STATUS_IDLE_MAX_MS = 5 * 60 * 1000;

const STATUS_STYLES = {
    online: { label: 'Online', dot: 'bg-emerald-500', tone: 'text-emerald-500' },
    idle: { label: 'Idle', dot: 'bg-yellow-500', tone: 'text-yellow-500' },
    offline: { label: 'Offline', dot: 'bg-red-500', tone: 'text-red-500' },
    unknown: {
        label: 'Unknown',
        dot: 'bg-muted-foreground',
        tone: 'text-muted-foreground',
    },
};

const getConnectionStatus = (lastSeenMs) => {
    if (!Number.isFinite(lastSeenMs) || lastSeenMs < 0) return 'unknown';
    if (lastSeenMs < STATUS_ONLINE_MAX_MS) return 'online';
    if (lastSeenMs < STATUS_IDLE_MAX_MS) return 'idle';
    return 'offline';
};

const formatElapsed = (ms) => {
    if (!Number.isFinite(ms) || ms < 0) return '—';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
};

// Render whatever the device reports. Numbers are assumed to be RSSI in dBm
// (the near-universal convention on ESP32 firmware); strings are passed
// through verbatim so a firmware that sends "good" / "fair" / "poor" just
// works.
const formatWifi = (wifi) => {
    if (wifi == null) return null;
    if (typeof wifi === 'number') return `${wifi} dBm`;
    return wifi;
};

const formatUptime = (ms) => {
    if (!Number.isFinite(ms) || ms < 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
};

export const DeviceStatusCard = ({ readings = [] }) => {
    // Tick once per second so "Last seen" counts up smoothly without needing
    // a fresh Firebase event. Local to this card so the chart doesn't
    // re-render on each tick.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Readings arrive newest-first from useReadings; the freshest one is the
    // best proxy for "is the sensor currently reporting?".
    const latest = readings.length > 0 ? readings[0] : null;
    const lastSeenMs =
        latest?.timestamp != null ? now - latest.timestamp : null;
    const statusKey = getConnectionStatus(lastSeenMs);
    const status = STATUS_STYLES[statusKey];
    // Wi-Fi and uptime are only meaningful while the device is actually
    // reporting. Once it drops offline (or we've never heard from it), the
    // last-known values are stale and misleading, so suppress them.
    const liveTelemetry = statusKey === 'online' || statusKey === 'idle';
    const uptime = liveTelemetry && latest ? formatUptime(latest.uptimeMs) : null;
    const wifi = liveTelemetry && latest ? formatWifi(latest.wifi) : null;
    // The firmware sets level: "offline" on every Firebase row when the
    // electrochemical sensor stops responding (timeouts/checksum errors).
    // Only trust this signal while the device itself is still reporting —
    // otherwise a stale "offline" row from hours ago would persist on screen
    // long after the device is unreachable.
    const sensorOffline = liveTelemetry && latest?.level === 'offline';

    return (
        <div className='flex flex-col rounded-lg border border-border bg-card/60 px-4 py-3 min-w-0'>
            <span className='text-[0.65rem] uppercase tracking-wider text-muted-foreground'>
                Device
            </span>
            <div className='mt-1 flex items-center gap-2'>
                <span
                    className={cn(
                        'h-2 w-2 rounded-full',
                        status.dot,
                        statusKey === 'online' && 'animate-pulse'
                    )}
                />
                <span
                    className={cn(
                        'text-lg font-semibold truncate',
                        status.tone
                    )}
                >
                    {status.label}
                </span>
            </div>
            <div className='mt-1 space-y-0.5 text-xs text-muted-foreground tabular-nums'>
                {sensorOffline && (
                    <div className='flex items-center gap-1.5 truncate text-red-400'>
                        <AlertTriangle className='h-3 w-3 shrink-0' />
                        <span className='truncate'>Sensor: Offline</span>
                    </div>
                )}
                {wifi && (
                    <div className='flex items-center gap-1.5 truncate'>
                        <Wifi className='h-3 w-3 shrink-0' />
                        <span className='truncate'>Wi-Fi: {wifi}</span>
                    </div>
                )}
                {uptime && (
                    <div className='truncate'>Up {uptime}</div>
                )}
                <div className='flex items-center gap-1.5 truncate'>
                    <Clock className='h-3 w-3 shrink-0' />
                    <span className='truncate'>
                        {latest?.timestamp != null
                            ? formatElapsed(lastSeenMs)
                            : 'Never seen'}
                    </span>
                </div>
            </div>
        </div>
    );
};
