import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Activity,
    ArrowUp,
    Heart,
    Mail,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const productLinks = [
    { name: 'Overview', type: 'hash', target: 'onboarding' },
    { name: 'Live Dashboard', type: 'hash', target: 'dashboard' },
    { name: 'About', type: 'route', to: '/about' },
];

const resourceLinks = [
    {
        name: 'WHO Air Quality Guidelines',
        href: 'https://www.who.int/publications/i/item/9789240034228',
    },
    {
        name: 'EPA Formaldehyde Facts',
        href: 'https://www.epa.gov/formaldehyde',
    },
];

export const Footer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    const handleHashClick = (e, target) => {
        e.preventDefault();
        if (isHome) {
            document
                .getElementById(target)
                ?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/#' + target);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderInternalLink = (item, key) => {
        const className =
            'group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-300';
        const label = (
            <>
                <span className='w-0 h-px bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300' />
                {item.name}
            </>
        );

        if (item.type === 'route') {
            return (
                <Link key={key} to={item.to} className={className}>
                    {label}
                </Link>
            );
        }
        return (
            <a
                key={key}
                href={'/#' + item.target}
                onClick={(e) => handleHashClick(e, item.target)}
                className={className}
            >
                {label}
            </a>
        );
    };

    return (
        <footer className='relative bg-card border-t border-border mt-12 overflow-hidden'>
            {/* Decorative gradient glow */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-primary/60 to-transparent'
            />
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-160 rounded-full bg-primary/10 blur-3xl'
            />

            <div className='container relative py-14'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Brand */}
                    <div className='lg:col-span-2 max-w-md'>
                        <Link
                            to='/'
                            className='inline-flex items-center gap-2 text-xl font-bold text-foreground'
                        >
                            <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary'>
                                <Activity size={18} />
                            </span>
                            <span>
                                <span className='text-glow text-foreground'>
                                    Formaldehyde
                                </span>{' '}
                                Monitor
                            </span>
                        </Link>
                        <p className='mt-4 text-sm leading-relaxed text-muted-foreground'>
                            Real-time CH₂O air quality monitoring for safer
                            indoor environments. Stay informed, stay healthy.
                        </p>
                        <div className='mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground'>
                            <ShieldCheck
                                size={14}
                                className='text-primary'
                            />
                            Built with WHO &amp; EPA safety thresholds
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className='text-sm font-semibold tracking-wide text-foreground uppercase'>
                            Product
                        </h3>
                        <ul className='mt-4 space-y-3'>
                            {productLinks.map((item, key) => (
                                <li key={key}>{renderInternalLink(item, key)}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className='text-sm font-semibold tracking-wide text-foreground uppercase'>
                            Resources
                        </h3>
                        <ul className='mt-4 space-y-3'>
                            {resourceLinks.map((item, key) => (
                                <li key={key}>
                                    <a
                                        href={item.href}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-300'
                                    >
                                        <span className='w-0 h-px bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300' />
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className='mt-12 h-px w-full bg-border' />

                {/* Bottom row */}
                <div className='mt-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between'>
                    <p className='text-xs text-muted-foreground text-center sm:text-left'>
                        &copy; {new Date().getFullYear()}{' '}
                        <span className='text-foreground/80 font-medium'>
                            DotLee, Studio
                        </span>
                        . All rights reserved.
                    </p>

                    <p className='inline-flex items-center gap-1.5 text-xs text-muted-foreground'>
                        Made with
                        <Heart
                            size={12}
                            className='text-primary fill-primary animate-pulse-subtle'
                        />
                        for cleaner air
                    </p>

                    <div className='flex items-center gap-2'>
                        <a
                            href='mailto:klee@usa.edu.ph'
                            aria-label='Email'
                            className={cn(
                                'inline-flex h-9 w-9 items-center justify-center rounded-full',
                                'border border-border bg-background/60 text-muted-foreground',
                                'hover:text-primary hover:border-primary/50 transition-all duration-300'
                            )}
                        >
                            <Mail size={15} />
                        </a>
                        <button
                            type='button'
                            onClick={scrollToTop}
                            aria-label='Back to top'
                            className={cn(
                                'inline-flex h-9 w-9 items-center justify-center rounded-full',
                                'bg-primary/15 text-primary',
                                'hover:bg-primary hover:text-primary-foreground',
                                'hover:shadow-[0_0_14px_rgba(16,185,129,0.6)]',
                                'transition-all duration-300 hover:scale-105 active:scale-95'
                            )}
                        >
                            <ArrowUp size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
