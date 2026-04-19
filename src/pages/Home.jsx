import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Onboarding } from '../components/Onboarding';
import { Dashboard } from '../components/Dashboard';

export const Home = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            requestAnimationFrame(() => {
                document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }, [location]);

    return (
        <div className='min-h-screen bg-background text-foreground overflow-x-hidden'>
            {/* Navbar */}
            <Navbar />
            {/* Main Content */}
            <main>
                <Onboarding />
                <Dashboard />
            </main>
            {/* Footer */}
            <Footer />
        </div>
    );
};
