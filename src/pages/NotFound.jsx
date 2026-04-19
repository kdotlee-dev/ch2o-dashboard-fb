import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
    return (
        <main className='min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4'>
            <div className='container max-w-xl mx-auto text-center space-y-6'>
                <p className='text-sm font-semibold tracking-widest text-primary uppercase'>
                    404 Error
                </p>
                <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
                    Page not found
                </h1>
                <p className='text-muted-foreground text-lg'>
                    The page you are looking for does not exist or has been moved.
                </p>
                <div className='pt-4'>
                    <Link to='/' className='primary-button inline-flex items-center gap-2'>
                        <ArrowLeft className='h-4 w-4' />
                        Back to dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
};
