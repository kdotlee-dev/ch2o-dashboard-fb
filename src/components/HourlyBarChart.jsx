import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
    DANGER_LIMIT_PPM,
    SAFE_LIMIT_PPM,
    getSafetyLevel,
} from '@/lib/safety';

echarts.use([
    BarChart,
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    LegendComponent,
    CanvasRenderer,
]);

const BAND_COLORS = {
    SAFE: '#10b981',
    WARNING: '#eab308',
    DANGER: '#ef4444',
    UNKNOWN: 'rgba(148,163,184,0.35)',
};

const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;

const formatPpm = (value) =>
    Number.isFinite(value) ? `${value.toFixed(3)} ppm` : '—';

export const HourlyBarChart = ({
    readings = [],
    status = 'ready',
    error = null,
}) => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    // Bucket every reading into its local hour-of-day so the chart matches
    // what the viewer actually experienced (e.g. "this is what 7am at my
    // desk looks like"). We keep the count too so the tooltip can explain
    // how many samples the average is built from — a single 3am reading
    // that happens to spike shouldn't look the same as a solid hour of
    // warnings.
    const buckets = useMemo(() => {
        const acc = Array.from({ length: 24 }, () => ({ sum: 0, n: 0 }));
        for (const r of readings) {
            if (!Number.isFinite(r.ch2o) || !Number.isFinite(r.timestamp)) continue;
            const h = new Date(r.timestamp).getHours();
            acc[h].sum += r.ch2o;
            acc[h].n += 1;
        }
        return acc.map((b, hour) => ({
            hour,
            avg: b.n ? b.sum / b.n : null,
            count: b.n,
        }));
    }, [readings]);

    const hasData = useMemo(() => buckets.some((b) => b.count > 0), [buckets]);

    // Hybrid y-axis: always scale to the data so quiet days still produce
    // legible bars, but clamp to a sensible floor so noise near zero
    // doesn't dramatize itself. The WHO/OSHA reference lines may end up
    // off-axis as a result — we surface that via badges below so the
    // safety context is never lost.
    const yMax = useMemo(() => {
        const maxAvg = buckets.reduce(
            (acc, b) => (b.avg != null && b.avg > acc ? b.avg : acc),
            0
        );
        return Math.max(maxAvg * 1.6, 0.01);
    }, [buckets]);

    // Which threshold reference lines have been pushed off the top of the
    // chart by the dynamic scale. These get rendered as small corner
    // badges so the reader still knows where the limits sit.
    const offChartThresholds = useMemo(() => {
        const items = [];
        if (yMax < SAFE_LIMIT_PPM) {
            items.push({ key: 'WHO', value: SAFE_LIMIT_PPM, color: '#eab308' });
        }
        if (yMax < DANGER_LIMIT_PPM) {
            items.push({ key: 'OSHA', value: DANGER_LIMIT_PPM, color: '#ef4444' });
        }
        return items;
    }, [yMax]);

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
        const series = buckets.map((b) => {
            if (b.avg == null) {
                return { value: 0, itemStyle: { color: BAND_COLORS.UNKNOWN } };
            }
            const level = getSafetyLevel(b.avg);
            return {
                value: b.avg,
                itemStyle: { color: BAND_COLORS[level.key] ?? BAND_COLORS.SAFE },
            };
        });

        return {
            animation: true,
            animationDuration: 400,
            grid: {
                left: 8,
                right: 16,
                top: 36,
                bottom: 32,
                containLabel: true,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(17, 24, 39, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                textStyle: { color: '#e5e7eb', fontSize: 12 },
                formatter: (params) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    const [p] = params;
                    const b = buckets[p.dataIndex];
                    if (!b || b.count === 0) {
                        return (
                            `<div style="opacity:0.75;font-size:11px;margin-bottom:4px">` +
                            `${formatHour(p.dataIndex)}–${formatHour((p.dataIndex + 1) % 24)} local</div>` +
                            `<div style="opacity:0.85">No readings</div>`
                        );
                    }
                    const level = getSafetyLevel(b.avg);
                    return [
                        `<div style="opacity:0.75;font-size:11px;margin-bottom:4px">`,
                        `${formatHour(b.hour)}–${formatHour((b.hour + 1) % 24)} local</div>`,
                        `<div style="font-weight:600">${formatPpm(b.avg)}</div>`,
                        `<div style="opacity:0.8;font-size:11px;margin-top:2px">${level.label} · ${b.count} reading${b.count === 1 ? '' : 's'}</div>`,
                    ].join('');
                },
            },
            xAxis: {
                type: 'category',
                data: buckets.map((b) => formatHour(b.hour)),
                axisLine: { lineStyle: { color: 'rgba(148,163,184,0.3)' } },
                axisTick: { show: false },
                axisLabel: {
                    color: 'rgb(148,163,184)',
                    fontSize: 11,
                    interval: 2,
                },
            },
            yAxis: {
                type: 'value',
                name: 'ppm',
                nameGap: 12,
                nameTextStyle: {
                    color: 'rgb(148,163,184)',
                    fontSize: 11,
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
            series: [
                {
                    name: 'Avg ppm',
                    type: 'bar',
                    data: series,
                    barMaxWidth: 22,
                    itemStyle: { borderRadius: [4, 4, 0, 0] },
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
                },
            ],
        };
    }, [buckets, yMax]);

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.setOption(option, { notMerge: true });
    }, [option]);

    const isLoading = status === 'loading';
    const isError = status === 'error';
    const isEmpty = status === 'ready' && !hasData;

    return (
        <div className='w-full'>
            <div className='mb-4 px-1'>
                <h2 className='text-lg font-semibold'>Average by hour of day</h2>
                <p className='text-sm text-muted-foreground'>
                    Mean ppm per local hour, colored by the resulting safety band.
                </p>
            </div>

            <div className='relative rounded-xl border border-border bg-card shadow-sm overflow-hidden'>
                <div
                    ref={containerRef}
                    className='w-full h-[320px] md:h-[380px]'
                    aria-label='Average ppm by hour of day bar chart'
                    role='img'
                />

                {offChartThresholds.length > 0 && (
                    <div className='pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-1.5'>
                        {offChartThresholds.map((t) => (
                            <div
                                key={t.key}
                                className='flex items-center gap-1.5 rounded-md border border-border bg-card/90 px-2 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm'
                            >
                                <span
                                    className='inline-block h-2 w-2 rounded-full'
                                    style={{ backgroundColor: t.color }}
                                />
                                <span style={{ color: t.color }}>
                                    {t.key} {t.value} ppm
                                </span>
                                <span className='text-muted-foreground'>
                                    ↑ off chart
                                </span>
                            </div>
                        ))}
                    </div>
                )}

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
                                No readings yet.
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
