import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReadings } from '@/hooks/useReadings';
import {
    DEFAULT_TIME_RANGE_ID,
    getTimeRangeById,
} from '@/lib/timeRanges';
import { HourlyBarChart } from './HourlyBarChart';
import { ReadingsChart } from './ReadingsChart';
import { ReadingsTable } from './ReadingsTable';
import { SafetyPieChart } from './SafetyPieChart';
import { TimeRangePicker } from './TimeRangePicker';

export const Dashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // URL drives state so ?range=24h is shareable and survives reloads. Fall
    // back to the default whenever the param is missing or unrecognized.
    const rangeParam = searchParams.get('range');
    const range = getTimeRangeById(rangeParam);
    const rangeId = range.id;

    const handleRangeChange = useCallback(
        (nextId) => {
            const next = new URLSearchParams(searchParams);
            if (!nextId || nextId === DEFAULT_TIME_RANGE_ID) {
                next.delete('range');
            } else {
                next.set('range', nextId);
            }
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    const readingsState = useReadings({
        mode: range.mode,
        rangeMs: range.rangeMs,
    });

    return (
        <section
            id='dashboard'
            className='relative min-h-screen flex flex-col items-center justify-start px-4 py-24'
        >
            <div className='container max-w-5xl mx-auto z-10 space-y-10'>
                <div className='text-center space-y-3'>
                    <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
                        Dashboard
                    </h1>
                    <p className='text-muted-foreground max-w-2xl mx-auto'>
                        Real-time formaldehyde readings streamed from the sensor. Values
                        are classified against WHO and OSHA guidelines.
                    </p>
                </div>

                <div className='flex justify-center'>
                    <TimeRangePicker
                        value={rangeId}
                        onChange={handleRangeChange}
                    />
                </div>

                <ReadingsChart
                    readings={readingsState.readings}
                    status={readingsState.status}
                    error={readingsState.error}
                    range={range}
                />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <SafetyPieChart
                        readings={readingsState.readings}
                        status={readingsState.status}
                        error={readingsState.error}
                    />
                    <HourlyBarChart
                        readings={readingsState.readings}
                        status={readingsState.status}
                        error={readingsState.error}
                    />
                </div>

                <ReadingsTable
                    readings={readingsState.readings}
                    status={readingsState.status}
                    error={readingsState.error}
                    clearAll={readingsState.clearAll}
                    deleteReading={readingsState.deleteReading}
                    loadMore={readingsState.loadMore}
                    loadingMore={readingsState.loadingMore}
                    hasMore={readingsState.hasMore}
                />
            </div>
        </section>
    );
};
