import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
    { name: 'Overview', type: 'hash', target: 'onboarding' },
    { name: 'Dashboard', type: 'hash', target: 'dashboard' },
    { name: 'About', type: 'route', to: '/about' },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isHome = location.pathname === '/';
    const isTransparent = !isScrolled && isHome;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleHashClick = (e, target) => {
        e.preventDefault();
        setIsMenuOpen(false);
        if (isHome) {
            document
                .getElementById(target)
                ?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/#' + target);
        }
    };

    const renderNavLink = (item, key, className) => {
        if (item.type === 'route') {
            return (
                <Link
                    key={key}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={className}
                >
                    {item.name}
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
                {item.name}
            </a>
        );
    };

    return (
        <nav
            className={cn(
                'fixed w-full z-40 transition-all duration-300',
                isTransparent
                    ? 'py-5 bg-transparent'
                    : 'py-3 bg-background backdrop-blur-md shadow-xs'
            )}
        >
            <div className='container flex items-center justify-between'>
                <Link
                    className='text-xl font-bold text-primary flex items-center'
                    to='/'
                    onClick={() => setIsMenuOpen(false)}
                >
                    <span className={cn(
                        'relative z-10',
                        isTransparent && '[text-shadow:0_2px_8px_rgb(0_0_0_/0.7)]'
                    )}>
                        <span className={cn(
                            'text-glow',
                            isTransparent ? 'text-white' : 'text-foreground'
                        )}> Formaldehyde </span> Monitor
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className='hidden md:flex space-x-8'>
                    {navItems.map((item, key) =>
                        renderNavLink(
                            item,
                            key,
                            cn(
                                'hover:text-primary transition-colors duration-300',
                                isTransparent
                                    ? 'text-white/90 [text-shadow:0_2px_8px_rgb(0_0_0_/0.7)]'
                                    : 'text-foreground/80'
                            )
                        )
                    )}
                </div>

                {/* Mobile Navigation */}
                <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className={cn(
                        'md:hidden p-2 z-50',
                        isTransparent ? 'text-white' : 'text-foreground'
                    )}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMenuOpen ? <X size={24}/> : <Menu size={24} />}
                </button>
                <div
                    className={cn(
                        'fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center',
                        'transition-all duration-300 md:hidden',
                        isMenuOpen
                            ? 'opacity-100 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                    )}
                >
                    <div className='flex flex-col space-y-8 text-xl'>
                        {navItems.map((item, key) =>
                            renderNavLink(
                                item,
                                key,
                                'text-foreground/80 hover:text-primary transition-colors duration-300'
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
