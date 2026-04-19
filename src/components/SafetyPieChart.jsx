import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
    TooltipComponent,
    LegendComponent,
    TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getSafetyLevel, getSafetyLevelByLabel } from '@/lib/safety';

echarts.use([
    PieChart,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    CanvasRenderer,
]);

const BAND_COLORS = {
    SAFE: '#10b981',
    WARNING: '#eab308',
    DANGER: '#ef4444',
};

const BAND_LABELS = {
    SAFE: 'Safe',
    WARNING: 'Warning',
    DANGER: 'Danger',
};

const resolveLevel = (reading) =>
    getSafetyLevelByLabel(reading.level) ?? getSafetyLevel(reading.ch2o);

export const SafetyPieChart = ({
    readings = [],
    status = 'ready',
    error = null,
}) => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    const breakdown = useMemo(() => {
        const counts = { SAFE: 0, WARNING: 0, DANGER: 0 };
        for (const r of readings) {
            if (!Number.isFinite(r.ch2o) || !Number.isFinite(r.timestamp)) continue;
            const level = resolveLevel(r);
            if (counts[level.key] != null) counts[level.key] += 1;
        }
        const total = counts.SAFE + counts.WARNING + counts.DANGER;
        if (total === 0) return null;

        // Dominant band answers "is this usually fine?" at a glance — shown in
        // the donut's center hole.
        const dominant = ['SAFE', 'WARNING', 'DANGER'].reduce(
            (best, k) => (counts[k] > counts[best] ? k : best),
            'SAFE'
        );
        return { total, counts, dominant };
    }, [readings]);

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
        if (!breakdown) {
            return {
                series: [{ type: 'pie', data: [] }],
            };
        }

        const data = ['SAFE', 'WARNING', 'DANGER']
            .filter((k) => breakdown.counts[k] > 0)
            .map((k) => ({
                name: BAND_LABELS[k],
                value: breakdown.counts[k],
                itemStyle: { color: BAND_COLORS[k] },
            }));

        const dominantPct = Math.round(
            (breakdown.counts[breakdown.dominant] / breakdown.total) * 100
        );

        return {
            animation: true,
            animationDuration: 400,
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(17, 24, 39, 0.92)',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                textStyle: { color: '#e5e7eb', fontSize: 12 },
                formatter: (p) =>
                    `<div style="font-weight:600">${p.name}</div>` +
                    `<div style="opacity:0.85;font-size:11px;margin-top:2px">` +
                    `${p.value} reading${p.value === 1 ? '' : 's'} · ${p.percent.toFixed(1)}%` +
                    `</div>`,
            },
            legend: {
                bottom: 8,
                textStyle: { color: 'rgb(148,163,184)', fontSize: 12 },
                itemWidth: 10,
                itemHeight: 10,
                icon: 'circle',
            },
            series: [
                {
                    name: 'Safety band',
                    type: 'pie',
                    radius: ['55%', '78%'],
                    center: ['50%', '44%'],
                    avoidLabelOverlap: true,
                    padAngle: 2,
                    itemStyle: { borderRadius: 6 },
                    label: {
                        show: true,
                        position: 'center',
                        formatter: [
                            `{big|${dominantPct}%}`,
                            `{mid|${BAND_LABELS[breakdown.dominant]}}`,
                            `{small|${breakdown.total} reading${breakdown.total === 1 ? '' : 's'}}`,
                        ].join('\n'),
                        rich: {
                            big: {
                                fontSize: 28,
                                fontWeight: 600,
                                color: BAND_COLORS[breakdown.dominant],
                                lineHeight: 34,
                            },
                            mid: {
                                fontSize: 12,
                                color: 'rgb(148,163,184)',
                                lineHeight: 18,
                            },
                            small: {
                                fontSize: 11,
                                color: 'rgb(100,116,139)',
                                lineHeight: 16,
                            },
                        },
                    },
                    labelLine: { show: false },
                    emphasis: {
                        scale: true,
                        scaleSize: 6,
                        label: { show: true },
                    },
                    data,
                },
            ],
        };
    }, [breakdown]);

    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.setOption(option, { notMerge: true });
    }, [option]);

    const isLoading = status === 'loading';
    const isError = status === 'error';
    const isEmpty = status === 'ready' && !breakdown;

    return (
        <div className='w-full'>
            <div className='mb-4 px-1'>
                <h2 className='text-lg font-semibold'>Safety band distribution</h2>
                <p className='text-sm text-muted-foreground'>
                    Share of readings in each band across the selected window.
                </p>
            </div>

            <div className='relative rounded-xl border border-border bg-card shadow-sm overflow-hidden'>
                <div
                    ref={containerRef}
                    className='w-full h-[320px] md:h-[380px]'
                    aria-label='Safety band distribution pie chart'
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
                                No readings yet.
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
