import { ArrowDown } from 'lucide-react';
import enchantedTreeBg from '../assets/enchantedtree.png';
import { Link } from 'react-router-dom';

export const Onboarding = () => {
    return (
        <section
            id='onboarding'
            className='relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${enchantedTreeBg})` }}
        >
            <div className='absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80 z-0' />

            <div className='container max-w-4xl mx-auto text-center z-10'>
                <div className='space-y-6 [text-shadow:0_2px_12px_rgb(0_0_0_/0.65)]'>
                    <h1 className='text-4xl md:text-6xl font-bold tracking-tight text-white'>
                        <span className='opacity-0 animate-fade-in'> Know the Air you </span>
                        <span className='text-primary opacity-0 animate-fade-in-delay-1'>
                            Breathe.
                        </span>
                    </h1>

                    <p className='text-lg md:text-xl text-slate-100/90 max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3'>
                        Formaldehyde is a common compound with a wide variety of industrial uses.
                        Small concentrations are in the air that you, your employees,
                        and your family breathe every day - and it could be enough to put their health at risk.
                    </p>

                    <div className='pt-4 opacity-0 animate-fade-in-delay-4'>
                        <Link to="/about" className='primary-button'>
                            Learn more
                        </Link>
                    </div>
                </div>
            </div>

            <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce z-10 [text-shadow:0_2px_8px_rgb(0_0_0_/0.7)]'>
                <span className='text-sm text-slate-200 mb-2'> Scroll </span>
                <ArrowDown className='h-5 w-5 text-primary' />
            </div>
        </section>
    );
};