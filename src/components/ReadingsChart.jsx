import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    MarkAreaComponent,
    DataZoomComponent,
    LegendComponent,
    TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { AlertCircle, Loader2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DANGER_LIMIT_PPM,
    SAFE_LIMIT_PPM,
    getSafetyLevel,
    getSafetyLevelByLabel,
} from '@/lib/safety';
import { formatWindowLabel } from '@/lib/timeRanges';
import { DeviceStatusCard } from './DeviceStatusCard';
import { SafetyBreakdownCard } from './SafetyBreakdownCard';

echarts.use([
    LineChart,
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    MarkAreaComponent,
    DataZoomComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
]);

const tooltipTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const formatPpm = (value) =>
    Number.isFinite(value) ? `${value.toFixed(3)} ppm` : '—';

const resolveLevel = (reading) =>
    getSafetyLevelByLabel(reading.level) ?? getSafetyLevel(reading.ch2o);

const TREND_TONES = {
    safe: 'text-emerald-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    // Muted red for sensor-offline so it visually separates from a real
    // DANGER reading (which uses the brighter red-500).
    offline: 'text-red-400',
    neutral: 'text-foreground',
};

const toneFromLevelKey = (key) => {
    switch (key) {
        case 'SAFE':
            return 'safe';
        case 'WARNING':
            return 'warning';
        case 'DANGER':
            return 'danger';
        default:
            return 'neutral';
    }
};

const Stat = ({ label, value, sublabel, tone = 'neutral' }) => (
    <div className='flex flex-col rounded-lg border border-border bg-card/60 px-4 py-3 min-w-0'>
        <span className='text-[0.65rem] uppercase tracking-wider text-muted-foreground'>
            {label}
        </span>
        <span
            className={cn(
                'mt-1 text-lg font-semibold tabular-nums truncate',
                TREND_TONES[tone]
            )}
        >
            {value}
        </span>
        {sublabel && (
            <span className='text-xs text-muted-foreground tabular-nums truncate'>
                {sublabel}
            </span>
        )}
    </div>
);

export const ReadingsChart = ({
    readings = [],
    status = 'ready',
    error = null,
    range = null,
}) => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    // Firebase feed is newest-first; a time-series line needs chronological
    // order. We also drop points without usable values/timestamps so ECharts
    // doesn't have to deal with NaNs on the x/y axes.
    const points = useMemo(() => {
        return readings
            .filter(
                (r) => Number.isFinite(r.ch2o) && Number.isFinite(r.timestamp)
            )
            .map((r) => [r.timestamp, r.ch2o])
            .sort((a, b) => a[0] - b[0]);
    }, [readings]);

    const stats = useMemo(() => {
        if (points.length === 0) return null;
        const values = points.map((p) => p[1]);
        const latest = values[values.length - 1];
        const previous = values.length > 1 ? values[values.length - 2] : null;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const level = getSafetyLevel(latest);
        const delta = previous == null ? 0 : latest - previous;
        return { latest, previous, avg, min, max, level, delta };
    }, [points]);

    useEffect(() => {
        if (!containerRef.current) return;
        const chart = echarts.init(containerRef.current, null, {
            renderer: 'canvas',
        });
        chartRef.current = chart;

        const observer = new ResizeObserver(() => chart.resize());
        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    const option = useMemo(() => {
        // Keep the markArea's top band visible even when the highest reading
        // sits well below the OSHA limit.
        const maxData = points.reduce(
            (acc, [, v]) => (v > acc ? v : acc),
            0
        );
        const yMax = Math.max(maxData * 1.15, DANGER_LIMIT_PPM * 1.2, 0.25);

        return {
            animation: true,
            animationDuration: 400,
            grid: {
                left: 8,
                right: 24,
                top: 16,
                bottom: 64,
                containLabel: true,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'line' },
                backgroundColor: 'rgba(17, 24, 39, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                textStyle: { color: '#e5e7eb', fontSize: 12 },
                formatter: (params) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    const [first] = params;
                    const [ts, value] = first.data;
                    const level = getSafetyLevel(value);
                    return [
                        `<div style="opacity:0.75;font-size:11px;margin-bottom:4px">${tooltipTimeFormatter.format(
                            new Date(ts)
                        )}</div>`,
                        `<div style="font-weight:600">${formatPpm(value)}</div>`,
                        `<div style="opacity:0.8;font-size:11px;margin-top:2px">${level.label}</div>`,
                    ].join('');
                },
            },
            xAxis: {
                type: 'time',
                boundaryGap: false,
                axisLine: { lineStyle: { color: 'rgba(148,163,184,0.3)' } },
                axisTick: { show: false },
                axisLabel: {
                    color: 'rgb(148,163,184)',
                    hideOverlap: true,
                    fontSize: 11,
                },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                name: 'ppm',
                nameTextStyle: {
                    color: 'rgb(148,163,184)',
                    fontSize: 11,
                    padding: [0, 0, 6, 0],
                },
                min: 0,
                max: yMax,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: 'rgb(148,163,184)',
                    fontSize: 11,
                    formatter: (v) => (v < 0.1 ? v.toFixed(3) : v.toFixed(2)),
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(148,163,184,0.15)',
                        type: 'dashed',
                    },
                },
            },
            dataZoom: [
                { type: 'inside', throttle: 50 },
                {
                    type: 'slider',
                    height: 22,
                    bottom: 12,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(148,163,184,0.08)',
                    fillerColor: 'rgba(16,185,129,0.18)',
                    dataBackground: {
                        lineStyle: { color: 'rgba(16,185,129,0.6)' },
                        areaStyle: { color: 'rgba(16,185,129,0.1)' },
                    },
                    selectedDataBackground: {
                        lineStyle: { color: 'rgba(16,185,129,0.9)' },
                        areaStyle: { color: 'rgba(16,185,129,0.25)' },
                    },
                    handleStyle: { color: '#10b981' },
                    textStyle: { color: 'rgb(148,163,184)' },
                },
            ],
            series: [
                {
                    name: 'CH₂O',
                    type: 'line',
                    data: points,
                    smooth: true,
                    showSymbol: points.length <= 40,
                    symbolSize: 6,
                    sampling: 'lttb',
                    lineStyle: { color: '#10b981', width: 2 },
                    itemStyle: { color: '#10b981' },
                    emphasis: {
                        itemStyle: {
                            color: '#10b981',
                            borderColor: '#ffffff',
                            borderWidth: 2,
                        },
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(16,185,129,0.35)' },
                            { offset: 1, color: 'rgba(16,185,129,0.02)' },
                        ]),
                    },
                    markLine: {
                        symbol: 'none',
                        silent: true,
                        lineStyle: { type: 'dashed', width: 1 },
                        label: {
                            position: 'insideEndTop',
                            fontSize: 10,
                            backgroundColor: 'transparent',
                        },
                        data: [
                            {
                                yAxis: SAFE_LIMIT_PPM,
                                label: {
                                    formatter: `WHO ${SAFE_LIMIT_PPM} ppm`,
                                    color: '#eab308',
                                },
                                lineStyle: { color: '#eab308' },
                            },
                            {
                                yAxis: DANGER_LIMIT_PPM,
                                label: {
                                    formatter: `OSHA ${DANGER_LIMIT_PPM} ppm`,
                                    color: '#ef4444',
                                },
                                lineStyle: { color: '#ef4444' },
                            },
                        ],
                    },
                    markArea: {
                        silent: true,
                        itemStyle: { opacity: 1 },
                        data: [
                            [
                                {
                                    yAxis: 0,
                                    itemStyle: {
                                        color: 'rgba(16,185,129,0.07)',
                                    },
                                },
                                { yAxis: SAFE_LIMIT_PPM },
                            ],
                            [
                                {
                                    yAxis: SAFE_LIMIT_PPM,
                                    itemStyle: {
                                        color: 'rgba(234,179,8,0.07)',
                                    },
                                },
                                { yAxis: DANGER_LIMIT_PPM },
                            ],
                            [
                                {
                                    yAxis: DANGER_LIMIT_PPM,
                                    itemStyle: {
                                        color: 'rgba(239,68,68,0.07)',
                                    },
                                },
                                { yAxis: yMax },
                            ],
                        ],
                    },
                },
            ],
        };
    }, [points]);

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.setOption(option, { notMerge: true });
    }, [option]);

    const isLoading = status === 'loading';
    const isError = status === 'error';
    const isEmpty = status === 'ready' && points.length === 0;

    const latestLevel = stats ? resolveLevel({
        ch2o: stats.latest,
        level: null,
    }) : null;

    // The freshest row from Firebase, regardless of whether it had a numeric
    // ch2o_ppm. When the sensor is offline the firmware still uploads
    // heartbeat rows but omits ch2o_ppm and sets level: "offline". `points`
    // strips those out, so without this check the "Current" card would
    // happily display the last good reading from before the sensor failed.
    const latestRaw = readings.length > 0 ? readings[0] : null;
    const sensorOffline = Boolean(
        latestRaw &&
            (latestRaw.level === 'offline' ||
                (latestRaw.level == null && !Number.isFinite(latestRaw.ch2o)))
    );

    // All three summary stats (avg/min/max) are computed from the same
    // loaded window, so surface that explicitly under each card. In live
    // mode this is "Over last N readings"; in a range preset it's
    // "Over last 24 hours", etc.
    const windowLabel = formatWindowLabel(range, points.length);

    const trendTone = (() => {
        if (!stats || stats.previous == null) return 'neutral';
        if (Math.abs(stats.delta) < 1e-4) return 'neutral';
        return stats.delta > 0 ? 'warning' : 'safe';
    })();

    const TrendIcon = (() => {
        if (!stats || stats.previous == null) return Minus;
        if (Math.abs(stats.delta) < 1e-4) return Minus;
        return stats.delta > 0 ? TrendingUp : TrendingDown;
    })();

    return (
        <div className='w-full max-w-5xl mx-auto'>
            <div className='flex flex-wrap items-end justify-between gap-3 mb-4 px-1'>
                <div className='text-left'>
                    <h2 className='text-lg font-semibold'>
                        CH₂O trend
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                        Live ppm over time, with WHO and OSHA safety thresholds.
                    </p>
                </div>
                {stats && (
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 tabular-nums',
                                TREND_TONES[trendTone]
                            )}
                        >
                            <TrendIcon className='h-3.5 w-3.5' />
                            {stats.previous == null
                                ? 'First point'
                                : `${stats.delta >= 0 ? '+' : ''}${stats.delta.toFixed(
                                      3
                                  )} ppm vs previous`}
                        </span>
                    </div>
                )}
            </div>

            {/*
             * Row 1: top-level answers — is the sensor alive, what is it
             * reading right now, what's been normal lately.
             * Row 2: numeric stats over the selected window.
             * The grid is always rendered so the Device card (which works
             * even with zero readings) stays visible during loading states.
             */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mb-4'>
                <DeviceStatusCard readings={readings} />
                <Stat
                    label='Current'
                    value={sensorOffline || !stats ? '—' : formatPpm(stats.latest)}
                    sublabel={
                        sensorOffline
                            ? 'Sensor offline'
                            : stats
                                ? latestLevel?.label
                                : 'No data yet'
                    }
                    tone={
                        sensorOffline
                            ? 'offline'
                            : stats
                                ? toneFromLevelKey(latestLevel?.key)
                                : 'neutral'
                    }
                />
                <SafetyBreakdownCard readings={readings} />
                <Stat
                    label='Average'
                    value={stats ? formatPpm(stats.avg) : '—'}
                    sublabel={windowLabel}
                />
                <Stat
                    label='Minimum'
                    value={stats ? formatPpm(stats.min) : '—'}
                    sublabel={windowLabel}
                />
                <Stat
                    label='Maximum'
                    value={stats ? formatPpm(stats.max) : '—'}
                    sublabel={windowLabel}
                    tone={
                        stats
                            ? toneFromLevelKey(getSafetyLevel(stats.max).key)
                            : 'neutral'
                    }
                />
            </div>

            <div className='relative rounded-xl border border-border bg-card shadow-sm overflow-hidden'>
                <div
                    ref={containerRef}
                    className='w-full h-80 md:h-95'
                    aria-label='CH2O time series chart'
                    role='img'
                />

                {(isLoading || isError || isEmpty) && (
                    <div className='absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm'>
                        {isLoading && (
                            <span className='inline-flex items-center gap-2 text-sm text-muted-foreground'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Connecting to Firebase…
                            </span>
                        )}
                        {isError && (
                            <span className='inline-flex items-center gap-2 text-sm text-red-500'>
                                <AlertCircle className='h-4 w-4' />
                                Failed to load readings
                                {error?.message ? `: ${error.message}` : ''}
                            </span>
                        )}
                        {isEmpty && (
                            <span className='text-sm text-muted-foreground'>
                                No readings yet. Waiting for the first data point…
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
